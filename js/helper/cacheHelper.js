let moment = require('moment')
let fs = require('fs')

/**
 * 缓存文件前置路径
 */
const CACHE_FILE_PATH = './cache/';

/**
 * 取缓存文件名称
 * @param {string} key 
 */
let getCacheFileName = function(key) {
    if (!fs.existsSync(CACHE_FILE_PATH)) {
        fs.mkdirSync(CACHE_FILE_PATH);
    }
    return CACHE_FILE_PATH + key + '.json';
}

class CacheModel {
    /**
     * Creates an instance of CacheModel.
     * @param {object} cacheData 缓存对象{}
     * @param {number} [expiresMinute=30] 缓存失效时间 
     * @memberof CacheModel
     */
    constructor(cacheData, expiresMinute = 30) {
        this.cacheTime = moment().format('YYYY-MM-DD HH:mm:ss');
        this.expiresTime = moment().add(expiresMinute, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        this.cacheData = cacheData;
    }
}

class CacheHelper {
    /**
     * 从缓存中删除一个对象
     * 
     * @static
     * @param {string} key 缓存键
     * @returns {boolean} 返回操作是否成功
     * @memberof CacheHelper
     */
    static delete(key) {
        fs.unlink(getCacheFileName(key))
        return true;
    }

    /**
     * 判断是否存在指定键的记录
     * 
     * @static
     * @param {string} key 缓存键
     * @returns {boolean} 如果存在则返回true
     * @memberof CacheHelper
     */
    static exists(key) {
        return fs.existsSync(getCacheFileName(key));
    }

    /**
     * 从缓存服务中获取一个对象
     * 
     * @static
     * @param {string} key 缓存键
     * @returns {object} cacheData or null
     * @memberof CacheHelper
     */
    static get(key) {
        let cacheFileName = getCacheFileName(key);
        if (fs.existsSync(cacheFileName)) {
            let cacheJsonStr = fs.readFileSync(cacheFileName);
            let cacheInfo = JSON.parse(cacheJsonStr);
            if (moment(cacheInfo.expiresTime).toDate() > new Date()) {
                return cacheInfo.cacheData;
            }
        }
        return null;
    }

    /**
     * 设置一个缓存项,并指定有效期,操作成功则返回true。如果指定的键存在则更新其对应的值， 如果不存在则新建一个缓存项。
     * 
     * @static
     * @param {string} key 缓存键
     * @param {object} value 缓存值 
     * @param {number} [expiresMinute=30] 默认30分钟
     * @returns {boolean} 设置结果
     * @memberof CacheHelper
     */
    static set(key, value, expiresMinute = 30) {
        let cacheFileName = getCacheFileName(key);
        let cacheInfo = new CacheModel(value, expiresMinute);
        fs.writeFileSync(cacheFileName, JSON.stringify(cacheInfo), 'utf8');
        return true;
    }
}

module.exports = CacheHelper;