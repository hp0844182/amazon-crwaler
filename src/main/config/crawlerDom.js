/**
 * 需要爬取含有我們想要的鏈接的dom
 */

 // 產品详情链接
const detailDom = [
     '.s-result-list a.a-link-normal',
 '#mainResults .s-result-item a.a-link-normal'
]

// 頁碼链接
const pageDom = [
    '#pagnNextLink',
    '.a-last a'
]

export default {
    pageDom,
    detailDom,
}