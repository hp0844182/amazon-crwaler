import superagent from 'superagent';
require('superagent-charset')(superagent);
import cheerio from 'cheerio';
import { parseHtmlToTypes } from './tool';
import { ipcMain } from 'electron';
import { crawlerByTypes } from './apify/crawlerPdByType';


import Crawler from 'crawler';
import Apify from 'apify';
const { log } = Apify.utils;
// 亚马逊中国主站
const baseUrl = 'https://www.amazon.cn'



/**
 * 监听render进程爬取请求
 */
export function spiderListen(mainWindow, winId) {
    ipcMain.on('goSpider', (e, data) => {
        log.info(data)
        // 爬取商品信息
        crawlerByTypes(data, mainWindow, winId);
    })
}

/**
 * 重置數據
 */
export function resetData(mainWindow, winId) {
    ipcMain.on('resetData', (e, data) => {
        console.log('main进程要重置数据啦')
        resetApifyData(mainWindow, winId)
    })

}

async function resetApifyData(mainWindow, winId) {
    try {
        console.log('重置数据啦')
        const store = await Apify.openKeyValueStore();
        const queuePageList = await Apify.openRequestQueue('typeProducts');
        const queuePageProducts = await Apify.openRequestQueue('pageProducts');
        //打開數據庫
        const dataset = await Apify.openDataset('productType');
        const dataPage = await Apify.openDataset('productTypePage');
        await store.drop();
        await queuePageList.drop();
        await queuePageProducts.drop();
        await dataset.drop();
        await dataPage.drop();
        console.log('发消息回去啦')
        mainWindow.webContents.send('resetSuccess', true, winId)
    } catch (error) {
        mainWindow.webContents.send('resetSuccess', true, winId)
    }
    return null;
}   