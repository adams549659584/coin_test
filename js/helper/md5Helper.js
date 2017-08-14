let crypto = require('crypto')

class md5Helper {
    /**
     * md5加密
     * 
     * @param {String} text 要加密的文本
     * @returns {String} md5小写结果
     */
    static md5(text) {
        const hash = crypto.createHash('md5');
        hash.update(text);
        return hash.digest('hex').toUpperCase();
    }

    /**
     * md5加密
     * 
     * @param {String} text 要加密的文本
     * @returns {String} md5大写结果
     */
    static md5UpperCase(text) {
        return md5(text).toUpperCase();
    }
}

module.exports = md5Helper;