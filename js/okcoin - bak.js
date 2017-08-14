let https = require('https')
let querystring = require('querystring')
let signHelper = require('./helper/signHelper')
let Logger = require('./helper/logHelper')
let moment = require('moment')


const config = {
    apiKey: '',
    secretKey: '',
    /**
     * 接口host
     */
    hostname: 'www.okcoin.cn',
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
    },
    /**
     * 币标识
     * 
     */
    coinSymbol: {
        btc: 'btc_cny',
        ltc: 'ltc_cny',
        eth: 'eth_cny',
        // etc: 'etc_cny'
    },
    /**
     * 币费率
     */
    coinRate: {
        btc_cny: {
            buy: [{ count: 0, rate: 0.002 }],
            sell: [{ count: 0, rate: 0.002 }, { count: 100, rate: 0.0019 }, { count: 500, rate: 0.0018 }, { count: 1500, rate: 0.0017 }, { count: 3000, rate: 0.0016 }, { count: 5000, rate: 0.0015 }],
        },
        ltc_cny: {
            buy: [{ count: 0, rate: 0.002 }],
            sell: [{ count: 0, rate: 0.002 }, { count: 5000, rate: 0.0019 }, { count: 50000, rate: 0.0018 }, { count: 150000, rate: 0.0017 }, { count: 300000, rate: 0.0016 }, { count: 500000, rate: 0.0015 }]
        },
        eth_cny: {
            buy: [{ count: 0, rate: 0.0005 }],
            sell: [{ count: 0, rate: 0.0005 }],
        },
    },
    /**
     * 1min : '1分钟' 3min : 3分钟 5min : 5分钟 15min : 15分钟 30min : 30分钟 1day : 1日 3day : 3日 1week : 1周 1hour : 1小时 2hour : 2小时 4hour : 4小时 6hour : 6小时 12hour : 12小时
     * 
     */
    klineType: {
        m1: '1min',
        m2: '3min',
        m5: '5min',
        m15: '15min',
        m30: '30min',
        d1: '1day',
        d3: '3day',
        w1: '1week',
        h1: '1hour',
        h2: '2hour',
        h4: '4hour',
        h6: '6hour',
        h12: '12hour',
    }
}

/**
 * 普通请求
 * 
 * @param {String} path /api/v1/ticker.do?symbol=btc_cny
 * @param {httpMethod} method GET|POST
 * @param {any} paramData {}
 * @param {String} hostname 
 * @param {Number} port 80--http|443--https...
 * @returns 
 * @memberof OkCoinApi
 */
const request = function(path, method, paramData, hostname, port) {
    method = method || config.httpMethod.post;
    hostname = hostname || config.hostname;
    port = port || config.port;
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
            options.path += '?' + contents;
        }
        let req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let resultData = '';
            res.on('data', (chunk) => {
                resultData += chunk;
            })
            res.on('end', () => {
                resolve(resultData);
            })
            res.on('error', (err) => {
                reject(err);
            })
        });
        if (method == config.httpMethod.post) {
            req.write(contents);
        }
        req.end();
    })
}

/**
 * 加密请求
 * 
 * @param {String} path /api/v1/userinfo
 * @param {any} paramData {} 无需传api_key和sign，此函数自动补全这两个字段
 * @param {String} hostname 
 * @param {Number} port 80--http|443--https...
 * @returns 
 * @memberof OkCoinApi
 */
const signRequest = function(path, paramData, hostname, port) {
    paramData = paramData || {};
    paramData.api_key = config.apiKey;
    let sign = signHelper.sign(config.secretKey, paramData);
    paramData.sign = sign;
    return request(path, httpMethod.post, paramData, hostname, port);
}

class OkCoinApi {


    /**
     * Creates an instance of OkCoinApi.
     * @param {String} apikey 
     * @param {String} secretKey 
     * @memberof OkCoinApi
     */
    constructor(apikey, secretKey) {
        config.apiKey = apikey;
        config.secretKey = secretKey;
    }

    /**
     * 获取OKCoin行情 GET 
     * 
     * @memberof OkCoinApi
     */
    ticker() {
        let path = '/api/v1/ticker.do';
        let paramData = {
            //symbol: 'btc_cny'//(默认btc_cny)btc_cny:比特币 ltc_cny :莱特币 eth_cny :以太坊
        };
        request(path, httpMethod.get, paramData).then((res) => {
            console.log('获取OKCoin行情:');
            console.log(res);
        }, (err) => {
            console.log(err);
        })
    }

    /**
     * 获取OKCoin市场深度 GET
     * 
     * @memberof OkCoinApi
     */
    depth() {
        let path = '/api/v1/depth.do';
        let paramData = {
            //symbol: 'btc_cny',//(默认btc_cny)btc_cny:比特币 ltc_cny :莱特币 eth_cny :以太坊
            //size: 200,//否(默认200)value: 1-200
            //merge: 0.01//否(默认 merge参数不传时返回0.01深度) 合并深度: 1, 0.1
        };
        request(path, httpMethod.get, paramData).then((res) => {
            console.log('获取OKCoin市场深度:');
            console.log(res);
        }, (err) => {
            console.log(err);
        })
    }

    /**
     * 获取OKCoin最近600交易信息 GET
     * 
     * @memberof OkCoinApi
     */
    trades() {
        let path = '/api/v1/trades.do';
        let paramData = {
            symbol: 'btc_cny', //btc_cny:比特币    ltc_cny :莱特币    eth_cny :以太坊
            //since: 111111111111//tid:交易记录ID（返回数据不包括当前tid值,最多返回600条数据）
        };
        request(path, httpMethod.get, paramData).then((res) => {
            console.log('获取OKCoin最近600交易信息:');
            console.log(res);
        }, (err) => {
            console.log(err);
        })
    }

    /**
     * 获取比特币或莱特币的K线数据 GET 
     * 
     * @param {String} coinSymbol coinSymbol.btc
     * @param {String} type 1min : 1分钟 3min : 3分钟 5min : 5分钟 15min : 15分钟 30min : 30分钟 1day : 1日 3day : 3日 1week : 1周 1hour : 1小时 2hour : 2小时 4hour : 4小时 6hour : 6小时 12hour : 12小时
     * @memberof OkCoinApi
     */
    kline(coinSymbol, type) {
        let path = '/api/v1/kline.do';
        let paramData = {
            symbol: coinSymbol || coinSymbol.btc, //(默认btc_cny)btc_cny:比特币 ltc_cny :莱特币 eth_cny :以太坊
            type: type //1min : 1分钟 3min : 3分钟 5min : 5分钟 15min : 15分钟 30min : 30分钟 1day : 1日 3day : 3日 1week : 1周 1hour : 1小时 2hour : 2小时 4hour : 4小时 6hour : 6小时 12hour : 12小时
        };
        return request(path, config.httpMethod.get, paramData)
            // .then((res) => {
            //     console.log('获取比特币或莱特币的K线数据:');
            //     console.log(res);
            // }, (err) => {
            //     console.log(err);
            // })
    }

    /**
     * 获取用户信息
     * 
     * @memberof OkCoinApi
     */
    userinfo() {
        let path = '/api/v1/userinfo.do';
        let paramData = {};
        signRequest(path, paramData).then((res) => {
            console.log('获取用户信息:');
            console.log(res);
        }, (err) => {
            console.log(err);
        })
    }

    /**
     * 获取用户提现/充值记录
     * 
     * @memberof OkCoinApi
     */
    account_records() {
        let path = '/api/v1/account_records.do';
        let paramData = {
            symbol: 'btc_cny',
            type: 0,
            current_page: 1,
            page_length: 50
        };
        signRequest(path, paramData).then((res) => {
            console.log('获取用户提现/充值记录:');
            console.log(res);
        }, (err) => {
            console.log(err);
        })
    }
}

module.exports = OkCoinApi;


class HoldCoin {
    /**
     * Creates an instance of HoldCoin.
     * @param {String} symbol 标识
     * @param {Number} count 数量
     * @memberof HoldCoin
     */
    constructor(symbol, count) {
        this.symbol = symbol;
        this.count = count;
    }
}
class Account {
    /**
     * Creates an instance of Account.
     * @param {Number} money 
     * @param {HoldCoin} holdCoin 
     * @param {Number} buyRate 
     * @param {Number} sellRate 
     * @memberof Account
     */
    constructor(money, holdCoin, buyRate, sellRate) {
        this.money = money;
        this.holdCoin = holdCoin;
        this.buyRate = buyRate;
        this.sellRate = sellRate;
    }
}


let okcoinApi = new OkCoinApi('789a567d-84f6-47fb-af75-3ef9f2013d4c', 'C601FBECF64B0309ED4F1E4A1BD00514');
// okcoinApi.ticker();
// okcoinApi.depth();
// okcoinApi.trades();
let holdCoin = new HoldCoin(config.coinSymbol.eth, 0);
let account = new Account(10000, holdCoin, 0.005, -0.005);

let angle = 30;
let slope = Math.sin(2 * Math.PI / 360 * angle);


// okcoinApi.kline(config.coinSymbol.eth, config.klineType.m15).then((res) => {
//     let result = calculateMA(30, JSON.parse(res));
//     Logger.log(JSON.stringify(result))
// })
let thatCoinSymbol = config.coinSymbol.ltc;
okcoinApi.kline(thatCoinSymbol, config.klineType.h1).then((res) => {
    let data = JSON.parse(res);
    if (res.indexOf('error_code') > -1) {
        Logger.log(JSON.stringify(data));
        return;
    }
    let dayCount = 30;
    let maData = calculateMA(dayCount, data);
    data.forEach((value, index) => {
        let thatDate = moment(moment.unix(value[0] / 1000)).toDate()
        thatDate.setHours(thatDate.getHours() + 8);
        value[0] = thatDate;
        if (index >= dayCount && account.money > 0) {
            if (value[4] > parseFloat(maData[index])) {
                let allTempCount = 5,
                    riseCount = 0;
                let riseRate = 0.8;
                for (let j = index - allTempCount; j < index; j++) {
                    if (data[j][4] > parseFloat(maData[j]) && data[j][4] > data[j - 1][4]) {
                        riseCount += 1;
                    }
                }
                if (riseCount / allTempCount > riseRate) {
                    let tempCount = Math.round((account.money / value[4]) * 100) / 100;
                    let tempMoney = (value[4] * tempCount);
                    let tempRateAmt = calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
                    if (tempMoney + tempRateAmt > account.money) {
                        tempCount = Math.round(((account.money - tempRateAmt) / value[4]) * 100) / 100;
                        let tempMoney = (value[4] * tempCount);
                        tempRateAmt = calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
                        tempMoney += tempRateAmt;
                    }
                    if (tempCount > 0 && tempMoney > 0 && account.money > tempMoney) {
                        account.holdCoin.count += tempCount;
                        account.money -= tempMoney;
                        Logger.log(`买入:${account.holdCoin.count}个,交易手续费：￥${tempRateAmt},当前余额:￥${account.money.toFixed(2)},当前买入币K线：${JSON.stringify(value)},MA${dayCount}:${maData[index]}`)
                    }
                }
            }
        }
        if (index >= dayCount && account.holdCoin.count > 0) {
            if (value[4] < parseFloat(maData[index])) {
                let allTempCount = 3,
                    fallCount = 0;
                let fallRate = 1;
                for (let j = index - allTempCount; j < index; j++) {
                    if (data[j][4] < parseFloat(maData[j]) || data[j][4] < data[j - 1][4]) {
                        fallCount += 1;
                    }
                }
                if (fallCount / allTempCount >= fallRate) {
                    let tempCount = account.holdCoin.count;
                    let tempMoney = value[4] * tempCount;
                    let tempRateAmt = calcRate(thatCoinSymbol, 2, tempCount, tempMoney);
                    account.holdCoin.count = 0;
                    account.money += tempMoney - tempRateAmt;
                    Logger.log(`卖出:${tempCount}个,交易手续费：￥${tempRateAmt},当前余额:￥${account.money.toFixed(2)},当前卖出币K线：${JSON.stringify(value)},MA${dayCount}:${maData[index]}`)
                }
            }
        }
        // if (index > 9 && account.money > 0) {
        //     let tempSumPrice = 0;
        //     for (let i = index - 10; i < index; i++) {
        //         let tempData = data[i];
        //         tempSumPrice += tempData[4];
        //     }
        //     let tempAvgPrice = tempSumPrice / 10;
        //     let thatAvgPrice = (value[1] + value[2] + value[3] + value[4]) / 4;
        //     let fluctuateRate = (value[1] - tempAvgPrice) / tempAvgPrice;
        //     //Logger.log(`tempAvgPrice:${tempAvgPrice},thatAvgPrice:${thatAvgPrice},fluctuateRate:${fluctuateRate}`)
        //     if (fluctuateRate > account.buyRate && account.money > 0 && account.holdCoin == 0) {
        //         let tempCount = Math.round((account.money / thatAvgPrice) * 100) / 100;
        //         let tempMoney = (thatAvgPrice * tempCount);
        //         if (account.money > tempMoney) {
        //             account.holdCoin.count += tempCount;
        //             account.money -= tempMoney;
        //             Logger.log(`买入:${account.holdCoin.count}个,当前余额:${account.money}`)
        //         }
        //     }
        //     else if (fluctuateRate < account.sellRate && account.holdCoin.count > 0) {
        //         account.money = account.money + (thatAvgPrice * account.holdCoin.count);
        //         Logger.log(`卖出:${account.holdCoin.count}个,当前余额:${account.money}`)
        //         account.holdCoin.count = 0;
        //     }
        // }

        // if (account.money < 10 && account.holdCoin.count == 0) {
        //     Logger.log(`玩不起了,money:${account.money},count:${account.holdCoin.count}`)
        // }
        // Logger.log(JSON.stringify(value))
    })
})

// okcoinApi.userinfo();
// okcoinApi.account_records();

/**
 * 计算MA线
 * 
 * @param {Number} dayCount 天
 * @param {Array} data 数据
 * @param {string} [defaultPrice='99999999999'] 
 * @returns 
 */
function calculateMA(dayCount, data, defaultPrice = '99999999999') {
    let result = [];
    for (let i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push(defaultPrice);
            continue;
        }
        let sum = 0;
        for (let j = 0; j < dayCount; j++) {
            // [
            // 	1417536000000,	时间戳
            // 	2370.16,	开
            // 	2380,		高
            // 	2352,		低
            // 	2367.37,	收
            // 	17259.83	交易量
            // ]        
            sum += data[i - j][4];
        }
        //moment(moment.unix(data[i][0] / 1000)).format('YYYY-MM-DD HH:mm:ss SSS') + '---' + 
        result.push((sum / dayCount).toFixed(3));
    }
    return result;
}

/**
 * 计算交易费率
 * 
 * @param {coinSymbol} coinSymbol 币标识
 * @param {Number} orderType 1-buy 2-sell
 * @param {Number} orderCount 交易数量
 * @param {Number} orderAmt 交易金额
 * @returns 交易手续费
 */
function calcRate(coinSymbol, orderType, orderCount, orderAmt) {
    if (config.coinRate.hasOwnProperty(coinSymbol)) {
        let thatCoinRate = config.coinRate[coinSymbol];
        let orderRate = 0;
        let thatCoinOrderRates;
        switch (orderType) {
            case 1:
                thatCoinOrderRates = thatCoinRate.buy;
                break;
            case 2:
                thatCoinOrderRates = thatCoinRate.sell;
                break;
            default:
                throw `交易类型【${orderType}】不存在`;
        }
        thatCoinOrderRates.forEach((rate) => {
            if (orderCount > rate.count) {
                orderRate = rate.rate;
            }
        });
        let orderRateAmt = orderAmt * orderRate;
        return Math.round(orderRateAmt * 100) / 100;
    }
    throw `币【${coinSymbol}】不存在`;
}