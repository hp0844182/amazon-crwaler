export const formList = [
    {
        'field': 'taskname',//任务名
        'label':'任务名',
        'type': 'text',// 空间类型
        'required': true,//是否必须
    },
    {
        'field': 'country',//国家
        'label':'国家',
        'type': 'select',// 空间类型
        'dict':'country',
        'required': true,//是否必须
    },
    {
        'field': 'type',//类型
        'label':'爬取类型',
        'type': 'select',// 空间类型
        'dict':'crawlerType',// 爬去类型
        'required': true,//是否必须
    },
    // {
    //     'field': 'url',//爬去地址
    //     'label':'爬取地址',
    //     'type': 'text',// 控件类型
    //     'required': true,//是否必须
    // }, 
    // {
    //     'field': 'keywords',//关键字
    //     'label':'关键字',
    //     'type': 'text',// 空间类型
    //     'required': true,//是否必须
    // }, 
    // {
    //     'field': 'asins',//asins
    //     'label':'asins',
    //     'type': 'text',// 空间类型
    //     'placeholder':'输入asins,多个空格分开',
    //     'required': true,//是否必须
    // }

]

// 支持爬取的国家
export const country = [
    {
        key:'US',
        label:'美国'
    },
    {
        key:'GB',
        label:'英国'
    },
    {
        key:'DE',
        label:'德国'
    },
    {
        key:'ES',
        label:'西班牙'
    },
    {
        key:'FR',
        label:'法国'
    },
    {
        key:'IT',
        label:'意大利'
    },
    {
        key:'IN',
        label:'印度'
    },
    {
        key:'CA',
        label:'加拿大'
    },
    {
        key:'CN',
        label:'中国'
    }
]

export function getCountry(cou){
    const countryItem =  country.find(item=>{
        return item.key == cou
    })||{}
    return countryItem.label
}

// 爬去类型

export const crawlerType = [
    {
        key:'1',
        label:'关键字爬取'
    },
    {
        key:'2',
        label:'根据asin爬取'
    },
    {
        key:'3',
        label:'根据商铺爬取'
    }
]

export const  DICTENUM = {
    'COUNTRY':'country',
    'CRAWLERTYPE':'crawlerType',
    'KEYWORDS':'1', // 关键字
    'ASIN':'2', // asin
    'SHOP':'3', // 商铺
    'ADDTASK':'addTast',//添加任务
    'DELTASK':'deleteTask',// 删除任务
    'FINISHTASK':'finishedTast',
    'PROCECING':'2', // 进行中
    'FINISH':'3',//已完成
    'GETPRODUCTS':'getProducts',
    'EXPORTDATA':'exportData' // 导出数据
}

export const xslColunms = [
    {
        header: 'asin',
        key: 'asin',
        width: 38
    },
     {
        header: '商品名',
        key: 'title',
        width: 50
    },
    {
        header: '价格',
        key: 'priceParsed',
        width: 50
    },
    {
        header: '货币',
        key: 'currency',
        width: 50
    },
    {
        header: '国家',
        key: 'country',
        width: 50
    },
    {
        header: '状态',
        key: 'condition',
        width: 50
    },
    {
        header: '关键字',
        key: 'keyword',
        width: 50
    },
    {
        header: '商家',
        key: 'sellerName',
        width: 50
    },
    {
        header: '是否prime',
        key: 'prime',
        width: 50
    },
    {
        header: '产品详情地址',
        key: 'detailUrl',
        width: 100
    },
    {
        header: '产品list地址',
        key: 'sellerUrl',
        width: 100
    },
    
]

