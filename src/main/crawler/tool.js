import cheerio from 'cheerio';
import Apify from 'apify';
const baseUrl = 'https://www.amazon.cn';
// 需要爬取的类型
const types = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
/**
 * 解析页面获取产品类型
 */
export function parseHtmlToTypes(html) {
    const $ = cheerio.load(html);//2
    const productTypes = [];
    types.forEach(item => {
        $('#cat' + item + ' .a-color-base.sd-fontSizeL1.a-text-bold a').each((index, ele) => {
            const domel = $(ele);
            productTypes.push({
                name: domel.text(),
                url: baseUrl + domel.attr('href')
            })
        })
    })
    return productTypes;
}





