let fs = require('fs')
let path = require('path')
let pathHelper = require('./pathHelper')
let moment = require('moment')

/**
 * 日志写入任务是否运行中
 */
let TASK_IS_RUNING = false;
/**
 * 日志任务队列
 */
let TASK_LOGS = [];

/**
 * 日志队列模型
 * 
 * @class LogInfo
 */
class LogInfo {
    /**
     * Creates an instance of LogInfo.
     * @param {string} msg 
     * @param {string} filename 
     * @memberof LogInfo
     */
    constructor(msg, filename) {
        this.msg = msg;
        this.filename = filename;
    }
}

/**
 * 写日志
 * 
 * @returns 
 */
function writeLog() {
    if (TASK_IS_RUNING) {
        return;
    }
    TASK_IS_RUNING = true;
    let log = TASK_LOGS.shift();
    let dirname = path.dirname(log.filename);
    pathHelper.mkdirs(dirname, () => {
        fs.appendFile(log.filename, log.msg, 'utf8', function() {
            if (TASK_LOGS.length > 0) {
                TASK_IS_RUNING = false;
                writeLog();
            } else {
                TASK_IS_RUNING = false;
            }
        });
    })
}

class Logger {
    /**
     * 日志记录
     * 
     * @static
     * @param {string} msg 日志信息
     * @param {string} filename 日志文件名称
     * @param {boolean} [appendLogTime=true] 是否添加日志记录时间,默认添加
     * @returns 
     * @memberof Logger
     */
    static log(msg, filename, appendLogTime = true) {
        if (!msg) {
            return;
        }
        let logText;
        if (appendLogTime) {
            logText = `${moment().format('YYYY-MM-DD HH:mm:ss SSS')}:\r\n${msg}\r\n`
        } else {
            logText = `${msg}\r\n`;
        }
        filename = filename || `${moment().format('YYYYMMDDHH')}.log`;
        let fullFilename = path.join('./log/', filename);

        let log = new LogInfo(logText, fullFilename);
        TASK_LOGS.push(log);
        writeLog();
    }
}

module.exports = Logger;