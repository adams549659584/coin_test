let md5Helper = require('./md5Helper')

class SignHelper {
    /**
     * 
     * 
     * @static
     * @param {string} secretkey 
     * @param {object} parameters 
     * @returns 
     * @memberof SignHelper
     */
    static sign(secretkey, parameters) {
        let parameterArr = new Array();
        parameterArr.push(`secret_key=${secretkey}`)
        for (let key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                let val = parameters[key];
                parameterArr.push(`${key}=${val}`)
            }
        }
        parameterArr = parameterArr.sort();
        let text = parameterArr.join('&');
        let sign = md5Helper.md5UpperCase(text);
        return sign;
    }
}

module.exports = SignHelper;