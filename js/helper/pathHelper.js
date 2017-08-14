let fs = require('fs')
let path = require('path')

class PathHelper {

    /**
     * 异步创建多层目录
     * 
     * @static
     * @param {string} dirname 
     * @param {function} callback 
     * @memberof PathHelper
     */
    static mkdirs(dirname, callback) {
        fs.exists(dirname, (exists) => {
            if (exists) {
                if (typeof callback === 'function') {
                    callback();
                }
            } else {
                PathHelper.mkdirs(path.dirname(dirname), () => {
                    fs.mkdir(dirname, callback);
                })
            }
        })
    }

    /**
     * 同步创建多层目录
     * 
     * @static
     * @param {string} dirname 
     * @returns 
     * @memberof PathHelper
     */
    static mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (PathHelper.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }
}

module.exports = PathHelper;