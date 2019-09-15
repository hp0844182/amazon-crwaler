/**
 * 爬虫任务管理
 */
import { ipcMain } from 'electron';
import {utils} from 'apify';
const log = utils.log;
import dbUils from './db/dbUtils';

/**
 * 监听render进程爬取请求
 */
export function taskListen(mainWindow, winId) {
    let db = new dbUils();
    // 项目启动后将进行中的任务状态设置为失败，并删除相关products
    try {
        db.resetTask()
    } catch (error) {
        log.info(error.message)
    }
    
    // 监听新增任务
    ipcMain.on('addTast', (e, data) => {
        try {
            if(!db)
            db = new dbUils();
            db.addTask(data,(data)=>{
                mainWindow.webContents.send('backToWeb', data,winId)
            });
        } catch (error) {
            log.info(error.message)
            db.close();
        }
        
    })
    // 监听查询任务
    ipcMain.on('getTast', (e, data) => {
        try {
            if(!db)
            db = new dbUils();
            db.getTask((data)=>{
                log.info(data.msg)
                mainWindow.webContents.send('getTaskSuc', data,winId)
            });
        } catch (error) {
            log.info(error.message)
            db.close();
        }
        
    })
    // 监听删除
    ipcMain.on('deleteTask',(e,data)=>{
        try {
            if(!db)
            db = new dbUils();
            db.deleteTask(data,(data)=>{
                log.info(data.msg)
                mainWindow.webContents.send('backToWeb', data,winId)
            });
        } catch (error) {
            log.info(error.message)
            db.close();
        }
    })

    // 监听查询产品列表
    ipcMain.on('getProducts',(e,data)=>{
        log.info(Object.keys(data))
        try {
            if(!db)
            db = new dbUils();
            db.queryProduct(data,(data)=>{
                log.info(data)
                mainWindow.webContents.send('backToWeb', data,winId)
            });
        } catch (error) {
            log.info(error.message)
            db.close();
        }
    })
    // 导出数据
    ipcMain.on('exportData',(e,data)=>{
        try {
            if(!db)
            db = new dbUils();
            db.exportData(data,(data)=>{
                log.info(data)
                mainWindow.webContents.send('backToWeb', data,winId)
            });
        } catch (error) {
            log.info(error.message)
            db.close();
        }
    })
}
