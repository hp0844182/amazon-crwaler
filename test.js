const  Apify = require('apify');
const cheerio = require('cheerio')
const superagent = require('superagent');
require('superagent-charset')(superagent);
Apify.main(async () => {
    const sources = ['http://127.0.0.1:5500/index.html'];
    const requestList = await Apify.openRequestList('test', sources);
    const requestQueue = await Apify.openRequestQueue('test');

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 50, // <----------------------------------------
        requestList,
        requestQueue, // <---------------------------------------------------
        handlePageFunction: async ({ $, request }) => {
            console.log(`Processing :`,$('title').text());

            // Only enqueue new links from the category pages.
            if (!request.userData.detailPage) {
                await Apify.utils.enqueueLinks({
                    $,
                    requestQueue,
                    selector: 'a',
                    baseUrl: request.loadedUrl,
                    transformRequestFunction: req => {
                        // req.userData.detailPage = true;
                        return req;
                    },
                });
            }
        },
    })
    await crawler.run();
})


function getProductTypes() {
    const url = 'https://www.amazon.cn/dp/B009QPX7DC/ref=lp_2150549051_1_1?s=beauty&ie=UTF8&qid=1565456153&sr=1-1';
    superagent.get(url).end((err, res) => {
        if (err) {
            return console.log('页面拉取失败！');
        }
        const $ = cheerio.load(res.text)
        const productTypes = parseTypeDetail($,{url:url});
        console.log(productTypes)
    })
}

// getProductTypes()


function parseTypeDetail($,request) {
    // 获取产品详情信息
    const name = $('#productTitle').text();
    const bylineInfo = $('#bylineInfo').text();
    const comments = $('#acrCustomerReviewText').text().replace(/[^0-9]/ig, "");
    const stars = $('#centerCol .a-icon-alt').text().replace(/[^0-9.]/ig, "");
    const priceblock_ourprice = $("#priceblock_ourprice").text();
    const detailDom = $("#detail_bullets_id");
    let detail1 = '',detail2 = "",detail="";
    // 兩種詳情
    if(detailDom.text()){
        detailDom.find('ul li').each((index,el)=>{
            detail+=$(el).text();
        })
    }else{
        console.log($("#prodDetails .col1 tr").html())
        $("#prodDetails .col1 tr").each((index, el) => {
            console.log(index)
            $(el).find('td').each((index, ele) => {
                detail1 += $(ele).text() + ":";
            })
            detail1 += ","
        })
        $("#prodDetails .col2 tr").each((index, el) => {
            $(el).find('td').each((index, ele) => {
                detail2 += $(ele).text() + ":";
            })
            detail2 += ","
        })
        detail = detail1 + detail2;
    }
    // 圖片地址
    const imgUrl = $('#imgTagWrapperId img').attr('src');
    console.log($('#imgTagWrapperId img').attr('src'))
    // 詳情地址
    const url = request.url;
    // ASIN
    const asin = $('link[rel="canonical"]').attr('href').replace('https://www.amazon.cn/dp/',"")

    const item = {
        name: name, // 產品名
        bylineInfo,
        comments,// 評論數
        stars,// 評分
        price: priceblock_ourprice,//價格
        detail,// 詳情
        // imgUrl,
        url,
        asin
    }
    return item;
}