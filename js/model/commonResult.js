class CommonResult {
    /**
     * Creates an instance of CommonResult.
     * @param {number} code 
     * @param {boolean} result 
     * @param {string} message 
     * @param {object} data 
     * @memberof CommonResult
     */
    constructor(code, result = false, message, data) {
        this.code = code;
        this.result = result;
        this.message = message;
        this.data = data;
    }

    /**
     * 错误
     * 
     * @static
     * @param {string} [message='error'] 错误描述
     * @param {number} [code=1] 错误码
     * @param {object} [data={}] 错误结果集
     * @returns 
     * @memberof CommonResult
     */
    static error(message = 'error', code = 1, data = {}) {
        return new CommonResult(code, false, message, data);
    }

    /**
     * 成功
     * 
     * @static
     * @param {object} [data={}] 成功结果集
     * @param {string} [message='sucess'] 成功描述
     * @param {number} [code=0] 成功码
     * @returns 
     * @memberof CommonResult
     */
    static success(data = {}, message = 'sucess', code = 0) {
        return new CommonResult(code, true, message, data);
    }
}

module.exports = CommonResult;