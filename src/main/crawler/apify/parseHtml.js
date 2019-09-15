/**
 * 解析页面
 */
export function parseTypeDetail($,request) {
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
        
        $("#prodDetails .col1 tr").each((index, el) => {
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
    // const imgUrl = $('#imgTagWrapperId img').attr('src');

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