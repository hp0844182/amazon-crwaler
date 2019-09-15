import sqlite3 from 'sqlite3'
import Apify from 'apify';
import path from 'path'
import { remote,app } from 'electron'
const sqlite = sqlite3.verbose();
const { log } = Apify.utils;

const fields = [
    'asin', 'keyword', 'detailUrl', 'sellerUrl', 'country', 'currency', 'title', 'price', 'priceParsed',
    'condition', 'sellerName', 'prime', 'shippingInfo', 'shopUrl', 'taskid'
]
// 添加任务需要字段
const taskFields = [
    'taskname', 'type', 'country', 'url', 'keywords', 'asins', 'status'
]
// 查询任务字段
const queryTaskFields = [
    'id', 'created_at', 'updated_at', 'taskname', 'type', 'country', 'url', 'keywords', 'asins', 'status'
]
/**
 * 数据库操作类
 */
export default class dbUils {
    constructor() {
        const APP = process.type === "renderer" ? remote.app : app;
        const userDataPath = APP.getPath("userData");
        this.db = new sqlite.Database(userDataPath + '/db.db', function (err) {
            if (err) {
                console.log("数据库创建失败")
                return console.error(err.msg);
            }
            console.log('数据库链接创建成功！');
        })
        // 初始化创建表格
        this.db.run(`CREATE TABLE IF NOT EXISTS 'tasks' (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            'taskname' varchar(255) NOT NULL,
            'type' varchar(255) NOT NULL,
            'country' varchar(255) NOT NULL,
            'url' varchar(255) ,
            'keywords' varchar(255) ,
            'asins' varchar(255) ,
            'status' varchar(255) NOT NULL,
            'created_at' timestamp DEFAULT CURRENT_TIMESTAMP ,
            'updated_at' timestamp DEFAULT CURRENT_TIMESTAMP )`)
        this.db.run(`CREATE TABLE IF NOT EXISTS "products" (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            'asin' varchar(255) NOT NULL,
            'keyword' varchar(255) ,
            'detailUrl' varchar(255) ,
            'sellerUrl' varchar(255) ,
            'country' varchar(255) ,
            'currency' varchar(255) ,
            'title' varchar(255) ,
            'price' varchar(255) ,
            'priceParsed' varchar(255) ,
            'condition' varchar(255) ,
            'sellerName' varchar(255) ,
            'prime' varchar(255) ,
            'shippingInfo' varchar(255) ,
            'shopUrl' varchar(255) ,
            'taskid' varchar(255) NOT NULL,
            'created_at' timestamp DEFAULT CURRENT_TIMESTAMP ,
            'updated_at' timestamp DEFAULT CURRENT_TIMESTAMP )`)
    }
    close() {
        this.db.close();
    }
    updateTask(task) {
        const sql = `UPDATE tasks set status = ? WHERE id =?`;
        log.info(sql)
        this.db.run(sql, [task.status, task.id], function (err) {
            if (err) {
                return log.info(err.message)
                // callBack && callBack({ task:'addTast',code: -1, msg: err.message })
            }
            // console.log("数据插入成功！")
            // callBack && callBack({task:'addTast', code: 0, msg: '新增成功' })
        })
    }
    //添加任务
    addTask(task, callBack) {
        const addFiled = taskFields.join(',')
        const placeholders = taskFields.map((language) => '?').join(',');
        let sql = `INSERT INTO  tasks (${addFiled})
            VALUES (${placeholders})`
        const values = taskFields.map(item => {
            // 状态初始化为新建状态
            if (item === 'status')
                return "1"
            return task[item] || ""
        })
        this.db.run(sql, values, function (err) {
            if (err) {
                callBack && callBack({ task: 'addTast', code: -1, msg: err.message })
                return console.error(err.message);
            }
            console.log("数据插入成功！")
            callBack && callBack({ task: 'addTast', code: 0, msg: '新增成功' })
        })
    }
    deleteTask(id, callBack) {
        const sql = `DELETE FROM tasks WHERE id=?`;
        this.db.run(sql, id, (err) => {
            if (err) {
                callBack && callBack({ task: 'deleteTask', code: -1, msg: err.message })
                return console.error(err.message);
            }
            // 将该任务下的product也一并删除
            this.db.run(`DELETE FROM products WHERE taskid=?`, id, function (err) {
                if (err) {
                    callBack && callBack({ task: 'deleteTask', code: -1, msg: err.message })
                    return console.error(err.message);
                }
                console.log("数据删除成功！")
                callBack && callBack({ task: 'deleteTask', code: 0, msg: '删除成功！' })
            })
            // callBack && callBack({ task: 'deleteTask', code: 0, msg: '删除成功！' })
        })
    }
    // 查询所有任务
    getTask(callBack) {
        const query = queryTaskFields.join(',');
        const sql = `SELECT ${query} FROM tasks`;
        this.db.all(sql, (err, row) => {
            if (err) {
                callBack && callBack({ code: -1, msg: err.message })
                return console.error(err.message);
            }
            console.log("数据查询成功！")
            callBack && callBack({ code: 0, msg: '查询成功', data: row })
        })
    }
    //添加产品
    addProduct(pdt) {
        const addFiled = fields.join(',')
        const placeholders = fields.map((language) => '?').join(',');
        const values = fields.map(item => {

            return pdt[item] || ""
        })
        let sql = `INSERT INTO  products(${addFiled})
                    VALUES (${placeholders})`
        this.db.run(sql, values, function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log("数据插入成功！")
        })
    }

    //查询产品
    queryProduct(data, callBack) {
        const query = fields.join(',');
        const minPage = data.page * data.pageSize
        const pageSize = data.pageSize
        const sql = `SELECT id,  ${query} FROM products WHERE taskid=? LIMIT ${minPage},${pageSize}`;
        this.db.all(sql, data.id, (err, rowList) => {
            if (err) {
                callBack && callBack({ code: -1, msg: err.message, task: 'getProducts' })
                return console.error(err.message);
            }
            log.info(sql)
            // 获取总份页以及总记录书
            this.db.get(`SELECT  count(id) FROM products WHERE taskid=?`, data.id, (err, row) => {
                if (err) {
                    callBack && callBack({ code: -1, msg: err.message, task: 'getProducts' })
                    return console.error(err.message);
                }
                const totalNum = row['count(id)']
                const tatolPage = Math.ceil(totalNum / data.pageSize)
                callBack && callBack({ totalNum, tatolPage, code: 0, msg: '查询成功', data: rowList, task: 'getProducts' })
            })

        })
    }

    //导出某任务的数据
    exportData(data, callBack) {
        const query = fields.join(',');
        const sql = `SELECT id,  ${query} FROM products WHERE taskid=?`;
        this.db.all(sql, data.id, (err, rowList) => {
            if (err) {
                callBack && callBack({ code: -1, msg: err.message, task: 'exportData' })
                return console.error(err.message);
            }
            log.info(sql)
            callBack && callBack({ code: 0, msg: '查询成功', data: rowList, task: 'exportData' })
        })
    }

    // 程序重启将爬取中的任务设置为失败
    resetTask() {
        const sql = `UPDATE tasks set status = 4 WHERE status = 2`;
        this.db.run(sql, function (err) {
            if (err) {
                return log.info(err.message)
                // callBack && callBack({ task:'addTast',code: -1, msg: err.message })
            }
            // console.log("数据插入成功！")
            // callBack && callBack({task:'addTast', code: 0, msg: '新增成功' })
        })
    }

}
