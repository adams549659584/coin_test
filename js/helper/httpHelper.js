let http = require('http')
let https = require('https')
let querystring = require('querystring')
let Logger = require('./logHelper')

const config = {
    /**
     * 接口host
     */
    hostname: '',
    /**
     * http一般80，https一般443
     */
    port: 443,
    /**
     * http请求
     * 
     */
    httpMethod: {
        get: 'GET',
        post: 'POST'
    }
}

class HttpHelper {
    /**
     * Creates an instance of HttpHelper.
     * @param {String} hostname 接口host
     * @param {Number} port http一般80，https一般443
     * @memberof HttpHelper
     */
    constructor(hostname, port) {
        config.hostname = hostname;
        config.port = port;
    }

    /**
     * 请求
     * 
     * @param {String} path /api/v1/ticker.do?symbol=btc_cny
     * @param {string} [method='GET'] GET|POST
     * @param {any} [paramData={}] post数据
     * @returns 
     * @memberof HttpHelper
     */
    request(path, method = 'GET', paramData = {}) {
        method = method.toUpperCase();
        let hostname = config.hostname;
        let port = config.port;
        let myHttp = port == 443 ? https : http;
        return new Promise((resolve, reject) => {
            let options = {
                hostname: hostname,
                port: port,
                path: path,
                method: 'GET'
            };

            let contents = querystring.stringify(paramData);
            if (method == config.httpMethod.post) {
                options.method = config.httpMethod.post;
                options.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': contents.length
                }
            } else {
                if (options.path.indexOf('?') > -1) {
                    options.path += '&' + contents;
                } else {
                    options.path += '?' + contents;
                }
            }
            let req = myHttp.request(options, (res) => {
                res.setEncoding('utf8');
                let resultData = '';
                res.on('data', (chunk) => {
                    resultData += chunk;
                })
                res.on('end', () => {
                    resolve(resultData);
                })
                res.on('error', (err) => {
                    Logger.log(err + '', 'httpRequestErr.log');
                    reject(err);
                })
            });
            if (method == config.httpMethod.post) {
                req.write(contents);
            }
            req.end();
        })
    }
}


module.exports = HttpHelper;