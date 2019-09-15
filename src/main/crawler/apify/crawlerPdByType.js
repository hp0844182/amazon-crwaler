"use strict";
import Apify from 'apify';
import { parseTypeDetail } from './parseHtml';
import { createSearchUrls } from './createSearchUrls';
import parseSellerDetail from './parseSellerDetail';
import parseItemUrls from './parseItemUrls';
import queryDom from '../../config/crawlerDom';
import parsePaginationUrl from './parsePaginationUrl';
import { getOriginUrl, saveItem } from './utils';
import dbUils from '../db/dbUtils';
import SessionsCheerioCrawler from './crawler';
import rp from 'request-promise';
const { log } = Apify.utils;
const proxyApi = 'http://dev.energy67.top/api/?apikey=f4ecaa0417a649aafeb5e02a46a533141f6bae6&num=30&type=json&line=win&proxy_type=putong&sort=rand&model=all&protocol=http&addr'
/**
 * 根据render进程传入过来的产品类型页面进行爬取
 * @types :string[],url集合。
 */
export async function crawlerByTypes(data, mainWindow, winId) {

    Apify.main(async () => {
        log.info('爬虫开始。。。');
        const rep = await rp(proxyApi);
        let proxyUrls = null;
        try {
            let urlstr = JSON.parse(rep);
            proxyUrls = urlstr.map(item => {
                return "http://" + item;
            })
        } catch (error) {
            log.info(error.message)
        }
        log.info(proxyUrls);
        //初始化数据库链接
        const db = new dbUils();
        // 更新任务状态后通知render刷新任务状态
        mainWindow.webContents.send('backToWeb', { code: 0, msg: "任务状态更新",task:"finishedTast" }, winId)
        // 更新当前任务状态
        await db.updateTask({ status: '2', id: data.id })
        // 创建爬取url列表
        const requestQueue = await Apify.openRequestQueue('typeProducts');

        // 获取所要爬取的url
        const urls = await parseInput(data);
        log.info(urls)
        for (const searchUrl of urls) {
            log.info(searchUrl.url)
            await requestQueue.addRequest(searchUrl);
        }
        // 爬虫基本配置
        const config = {
            maxConcurrency: 40,
            maxRequestsPerCrawl: null,
            // useApifyProxy: true,
            // apifyProxyGroups: input.apifyProxyGroups || null,
            maxRequestRetries: 6,
            handlePageTimeoutSecs: 2.5 * 60 * 1000,
            // liveView: input.liveView ? input.liveView : true,
            country: data.country,
            autoscaledPoolOptions: {
                systemStatusOptions: {
                    maxEventLoopOverloadedRatio: 0.65,
                    maxCpuOverloadedRatio: 0.4,
                    maxClientOverloadedRatio: 0.3,
                },
            },
            proxyUrls: proxyUrls
        };
        log.info('创建爬虫')

        // 创建爬虫
        const crawler = new Apify.CheerioCrawler({
            requestQueue,
            ...config,
            maxOpenPagesPerInstance: 5,
            retireInstanceAfterRequestCount: 5,
            handlePageFunction: async ({ $, request }) => {
                const urlOrigin = await getOriginUrl(request);
                // add pagination and items on the search
                if (request.userData.label === 'page') {
                    // solve pagination if on the page, now support two layouts
                    const enqueuePagination = await parsePaginationUrl($, request);
                    if (enqueuePagination !== false) {
                        console.log(`Adding new pagination of search ${enqueuePagination}`);
                        await requestQueue.addRequest({
                            url: enqueuePagination,
                            userData: {
                                label: 'page',
                                keyword: request.userData.keyword,
                            },
                        });
                    }
                    // add items to the queue
                    try {
                        const items = await parseItemUrls($, request);
                        for (const item of items) {
                            await requestQueue.addRequest({
                                url: item.url,
                                userData: {
                                    label: 'seller',
                                    keyword: request.userData.keyword,
                                    asin: item.asin,
                                    detailUrl: item.detailUrl,
                                    sellerUrl: item.sellerUrl,
                                },
                            }, { forefront: true });
                        }
                    } catch (error) {
                        log.error(error.message)
                        await Apify.pushData({
                            status: 'No items for this keyword.',
                            url: request.url,
                            keyword: request.userData.keyword,
                        });
                    }
                    // extract info about item and about seller offers
                } else if (request.userData.label === 'seller') {
                    try {
                        const item = await parseSellerDetail($, request);
                        if (item) {
                            let paginationUrlSeller;
                            const paginationEle = $('ul.a-pagination li.a-last a');
                            if (paginationEle.length !== 0) {
                                paginationUrlSeller = urlOrigin + paginationEle.attr('href');
                            } else {
                                paginationUrlSeller = false;
                            }

                            // if there is a pagination, go to another page
                            if (paginationUrlSeller !== false) {
                                console.log(`Seller detail has pagination, crawling that now -> ${paginationUrlSeller}`);
                                await requestQueue.addRequest({
                                    url: paginationUrlSeller,
                                    userData: {
                                        label: 'seller',
                                        keyword: request.userData.keyword,
                                        sellers: item.sellers,
                                        country: request.userData.country,
                                        sellerUrl: request.userData.sellerUrl,
                                        detailUrl: request.userData.detailUrl,
                                        asin: request.userData.asin,
                                    },
                                }, { forefront: true });
                            } else {
                                console.log(`Saving item url: ${request.url}`);
                                await item.sellers.forEach((seller) => {
                                    console.log('添加啦')
                                    db.addProduct({
                                        ...item,
                                        ...seller,
                                        taskid: data.id
                                    })
                                })
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        //await saveItem('NORESULT', request, null, input, env.defaultDatasetId);
                    }
                }
            },

            // If request failed 4 times then this function is executed.
            handleFailedRequestFunction: async ({ request }) => {
                await Apify.pushData({
                    status: 'Page failed 4 times, check it out, what happened.',
                    url: request.url,
                    keyword: request.userData.keyword,
                });
                console.log(`Request ${request.url} failed 4 times`);
            },
            prepareRequestFunction: async ({ request }) => {
                request.headers['User-Agent'] = Apify.utils.getRandomUserAgent();
                return request

            }
        })
        await crawler.run().then(async () => {
            log.info('结束爬取')
            await requestQueue.drop();
            // 更新当前任务状态为已完成
            await db.updateTask({ status: '3', id: data.id });
            db.close();
            mainWindow.webContents.send('backToWeb', { code: 0, msg: "爬取成功！",task:"finishedTast" }, winId)

            // console.log('开始爬取产品详情。。。')
            // const data = await datasetPage.getData({ offset: 0, limit: 1000 })
            // console.log('开始爬取产品详情。。。',  data)
            //crawlerByPageUrl([],mainWindow, winId)
        })


    })
    return 1;
}

/**
 * 根据爬取类型进行数据转换
 */

function parseInput(data) {
    log.info(data.keywords, data.country)
    let input = {}
    try {
        switch (data.type) {
            case '1':
                input['country'] = data.country
                input['keywords'] = data.keywords.split(/\s+/)
                return createSearchUrls(input)
            case '2':
                input['country'] = data.country;
                input['asins'] = data.asins.split(/\s+/)
                return createSearchUrls(input)
            default:
                return [{
                    url: data.url,
                     userData: {
                        label: 'page',
                        country: data.country
                    },
                }]
        }
    } catch (error) {
        log.info(error.message)
    }

}





