let HttpHelper = require('./helper/httpHelper')
let Logger = require('./helper/logHelper')
let moment = require('moment')
let Account = require('./model/accountModel')
let HoldCoin = require('./model/holdCoinModel')

// http: //api.huobi.com/staticmarket/btc_kline_005_json.js?length=2000
let httpHelper = new HttpHelper('api.huobi.com', 80);

class HuoBiCoin {

    /**
     * 获取币标识
     * 
     * @returns 
     * @memberof HuoBiCoin
     */
    static coinSymbolType() {
        return {
            /**
             * 比特币
             */
            btc: 'btc',
            /**
             * 莱特币
             */
            ltc: 'ltc',
            /**
             * 以太坊
             */
            eth: 'eth',
            /**
             * 以太经典
             */
            etc: 'etc'
        };
    }

    /**
     * 获取k线时间类型
     * 
     * @static
     * @returns 
     * @memberof HuoBiCoin
     */
    static periodType() {
        return {
            /**
             * 1分钟线
             */
            m1: '001',
            /**
             * 2分钟线
             */
            m5: '005',
            /**
             * 15分钟线
             */
            m15: '015',
            /**
             * 30分钟线
             */
            m30: '030',
            /**
             * 60分钟线
             */
            m60: '060',
            /**
             * 小时线
             */
            h1: '060',
            /**
             * 日线
             */
            d1: '100',
            /**
             * 周线
             */
            w1: '200',
            /**
             * 月线
             */
            M1: '300',
            /**
             * 年线
             */
            Y1: '400'
        }
    }

    /**
     * huobi kline
     * 
     * @param {string} [coinSymbol='btc'] 币标识 
     * @param {string} [period='005'] 001	1分钟线    005	5分钟    015	15分钟    030	30分钟    060	60分钟    100	日线    200	周线    300	月线     400	年线
     * @param {number} [length=2000] 返回1~2000条数据
     * @returns 
     * @memberof HuoBiCoin
     */
    kline(coinSymbol = 'btc', period = '005', length = 2000) {
        return httpHelper.request(`/staticmarket/${coinSymbol}_kline_${period}_json.js?length=${length}`)
    }

    /**
     * 计算MA线
     * 
     * @param {number} dayCount 天
     * @param {Array} data 数据
     * @param {string} [defaultPrice='99999999999'] 
     * @param {number} [closingPriceIndex=4] 收盘价索引
     * @returns 
     */
    calculateMA(dayCount, data, defaultPrice = '99999999999', closingPriceIndex = 4) {
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
                sum += data[i - j][closingPriceIndex];
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
     * @param {number} orderType 1-buy 2-sell
     * @param {number} orderCount 交易数量
     * @param {number} orderAmt 交易金额
     * @returns 交易手续费
     */
    calcRate(coinSymbol, orderType, orderCount, orderAmt) {
        let orderRateAmt = orderAmt * 0.002;
        return Math.round(orderRateAmt * 100) / 100;

        // let coinRate = OkCoinApi.coinRate();
        // if (coinRate.hasOwnProperty(coinSymbol)) {
        //     let thatCoinRate = coinRate[coinSymbol];
        //     let orderRate = 0;
        //     let thatCoinOrderRates;
        //     switch (orderType) {
        //         case 1:
        //             thatCoinOrderRates = thatCoinRate.buy;
        //             break;
        //         case 2:
        //             thatCoinOrderRates = thatCoinRate.sell;
        //             break;
        //         default:
        //             throw `交易类型【${orderType}】不存在`;
        //     }
        //     thatCoinOrderRates.forEach((rate) => {
        //         if (orderCount > rate.count) {
        //             orderRate = rate.rate;
        //         }
        //     });
        //     let orderRateAmt = orderAmt * orderRate;
        //     return Math.round(orderRateAmt * 100) / 100;
        // }
        // throw `币【${coinSymbol}】不存在`;
    }
}

function logCoinOrder(thatCoinSymbol, period, money = 10000, closingPriceIndex = 4) {
    let holdCoin = new HoldCoin(thatCoinSymbol, 0);
    let account = new Account(money, holdCoin);
    let huoBiCoin = new HuoBiCoin();
    huoBiCoin.kline(thatCoinSymbol, period).then((res, err) => {
        let logFileName = `/huobilog/${thatCoinSymbol}-${period}-${moment().format('YYYYMMDDHHmm')}.log`;
        if (res.indexOf('err-code') > -1) {
            Logger.log(res, logFileName);
            return;
        }
        let data = JSON.parse(res);
        let dayCount = 30;
        let maData = huoBiCoin.calculateMA(dayCount, data);
        data.forEach((value, index) => {
            if (index >= dayCount && account.money > 0) {
                if (value[closingPriceIndex] > parseFloat(maData[index])) {
                    let allTempCount = 5,
                        riseCount = 0;
                    let riseRate = 0.8;
                    for (let j = index - allTempCount; j < index; j++) {
                        if (data[j][closingPriceIndex] > parseFloat(maData[j]) && data[j][closingPriceIndex] > data[j - 1][closingPriceIndex]) {
                            riseCount += 1;
                        }
                    }
                    if (riseCount / allTempCount > riseRate) {
                        let tempCount = Math.round((account.money / value[closingPriceIndex]) * 100) / 100;
                        let tempMoney = (value[closingPriceIndex] * tempCount);
                        let tempRateAmt = huoBiCoin.calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
                        if (tempMoney + tempRateAmt > account.money) {
                            tempCount = Math.round(((account.money - tempRateAmt) / value[closingPriceIndex]) * 100) / 100;
                            let tempMoney = (value[closingPriceIndex] * tempCount);
                            tempRateAmt = huoBiCoin.calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
                            tempMoney += tempRateAmt;
                        }
                        if (tempCount > 0 && tempMoney > 0 && account.money > tempMoney) {
                            account.holdCoin.count += tempCount;
                            account.money -= tempMoney;
                            Logger.log(`买入:${account.holdCoin.count}个,交易手续费：￥${tempRateAmt},当前余额:￥${account.money.toFixed(2)},当前买入币K线：${JSON.stringify(value)},MA${dayCount}:${maData[index]}`, logFileName)
                        }
                    }
                }
            }
            if (index >= dayCount && account.holdCoin.count > 0) {
                if (value[closingPriceIndex] < parseFloat(maData[index])) {
                    let allTempCount = 3,
                        fallCount = 0;
                    let fallRate = 1;
                    for (let j = index - allTempCount; j < index; j++) {
                        if (data[j][closingPriceIndex] < parseFloat(maData[j]) || data[j][closingPriceIndex] < data[j - 1][closingPriceIndex]) {
                            fallCount += 1;
                        }
                    }
                    if (fallCount / allTempCount >= fallRate) {
                        let tempCount = account.holdCoin.count;
                        let tempMoney = value[closingPriceIndex] * tempCount;
                        let tempRateAmt = huoBiCoin.calcRate(thatCoinSymbol, 2, tempCount, tempMoney);
                        account.holdCoin.count = 0;
                        account.money += tempMoney - tempRateAmt;
                        Logger.log(`卖出:${tempCount}个,交易手续费：￥${tempRateAmt},当前余额:￥${account.money.toFixed(2)},当前卖出币K线：${JSON.stringify(value)},MA${dayCount}:${maData[index]}`, logFileName)
                    }
                }
            }
        })
        if (account.money - money > 0) {
            Logger.log(`本金：￥${money},余额：￥${account.money.toFixed(2)},赚了￥${(account.money - money).toFixed(2)}`, logFileName)
        } else {
            if (account.holdCoin.count > 0) {
                Logger.log(`本金：￥${money},余额：￥${account.money.toFixed(2)},持币${account.holdCoin.count}个,价值约￥${(data[data.length-1][closingPriceIndex]*account.holdCoin.count).toFixed(2)}`, logFileName)
            } else {
                Logger.log(`本金：￥${money},余额：￥${account.money.toFixed(2)},亏了￥${(money -account.money).toFixed(2)}`, logFileName)
            }
        }
    });
}

let period = HuoBiCoin.periodType().h1;
logCoinOrder(HuoBiCoin.coinSymbolType().btc, period);
// logCoinOrder(HuoBiCoin.coinSymbolType().etc, period);
// logCoinOrder(HuoBiCoin.coinSymbolType().eth, period);
logCoinOrder(HuoBiCoin.coinSymbolType().ltc, period);