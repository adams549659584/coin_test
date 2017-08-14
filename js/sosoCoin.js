let HttpHelper = require('./helper/httpHelper')
let cheerio = require('cheerio')
let Logger = require('./helper/logHelper')
let moment = require('moment')
let Account = require('./model/accountModel')
let HoldCoin = require('./model/holdCoinModel')
let cacheHelper = require('./helper/cacheHelper')
let url = require('url')
let CommonResult = require('./model/commonResult')

let sosoConfig = {
    sid: ''
};
let httpHelper = new HttpHelper('b.sosobtc.com', 80);

let initSid = async() => {
    let cachekey = 'sosoCoinSid';
    let sid = cacheHelper.get(cachekey);
    if (sid && sid != '') {
        sosoConfig.sid = sid;
        return sosoConfig.sid;
    }
    let result = await httpHelper.request('/btc_huobi.html');
    let $ = cheerio.load(result);
    let evalText = $('#sid').html();
    evalText = evalText.replace('window', 'return sosoConfig').replace('eval(', '(').replace('}(\'(y', '})(\'(y').replace('}))', '})');
    evalText = eval(evalText);
    eval(evalText);
    cacheHelper.set(cachekey, sosoConfig.sid, 30);
    return sosoConfig.sid;
}
let linkArr = ['/btc_okcoin.html'];
let linkIndex = 0;
let coinSymbolArr = [];
let initCoinSymbol = async(link) => {
    Logger.log(`查询${link}...`, '/coinSymbol/querycoinSymbol.log', false);
    let cachekey = 'sosoCoinSymbols';
    let result = await httpHelper.request(link);
    let regSymbol = new RegExp(/window.\$symbol = ".*"/);
    let symbols = result.match(regSymbol);
    if (symbols.length > 0) {
        let symbol = symbols[0].replace('window.$symbol = "', '');
        symbol = symbol.split('"').join('');
        if (coinSymbolArr.indexOf(symbol) == -1) {
            coinSymbolArr.push(symbol);
        }
    }
    let $ = cheerio.load(result);
    let $allLinks = $('a.nowrap');
    for (let i = 0; i < $allLinks.length; i++) {
        let link = $allLinks[i];
        let thatHref = link.attribs.href;
        let thatLinkPath = url.parse(thatHref).path;
        if (linkArr.indexOf(thatLinkPath) == -1) {
            linkArr.push(thatLinkPath);
        }
    }
    linkIndex += 1;
    if (linkArr.length > linkIndex) {
        initCoinSymbol(linkArr[linkIndex])
    } else {
        Logger.log(JSON.stringify(coinSymbolArr), '/coinSymbol/coinSymbol.json');
        console.log('查询完毕：');
        console.log(coinSymbolArr);
    }
}

class SosoCoin {

    /**
     * 所有币标识
     * 
     * @static
     * @returns {string[]}
     * @memberof SosoCoin
     */
    static coinSymbols() {
            var coinSymbolArr = ["okcoin_btc_cny", "okcoincom_btc_usd", "okcoincom_ltc_usd", "okcoin_ltc_cny", "okcoinfutures_btcweek_usd", "okcoinfutures_btcnextweek_usd", "okcoinfutures_btcquarter_usd", "okcoinfutures_ltcweek_usd", "okcoinfutures_ltcnextweek_usd", "okcoinfutures_ltcquarter_usd", "btctrade_btc_cny", "btctrade_ltc_cny", "jubi_ltc_cny", "huobi_btc_cny", "huobi_ltc_cny", "796_btc_usd", "btc38_btc_cny", "btc38_ltc_cny", "btcchina_btc_cny", "btcchina_ltc_cny", "btcc_xbt_cny", "bitstamp_btc_usd", "coinbase_btc_usd", "bitfinex_btc_usd", "bitfinex_ltc_usd", "btce_btc_usd", "btce_ltc_usd", "itbit_btc_usd", "poloniex_btc_usd", "bitvc_btcweek_cny", "cnbtc_btc_cny", "cnbtc_ltc_cny", "btc100_btc_cny", "btc100_ltc_cny", "huobiusd_btc_usd", "yunbi_btc_cny", "bter_btc_cny", "bter_ltc_cny", "haobtc_btc_cny", "kraken_xbt_usd", "kraken_ltc_usd", "btcbox_btc_jpy", "dayibi_btc_cny", "bittrex_btc_usd", "dahonghuo_btc_cny", "btc38_bts_cny", "btc38_doge_cny", "btc38_xrp_cny", "btc38_xlm_cny", "btc38_nxt_cny", "btc38_blk_cny", "btc38_bils_cny", "btc38_bost_cny", "btc38_mec_cny", "btc38_wdc_cny", "btc38_qrk_cny", "btc38_ybc_cny", "btc38_zcc_cny", "btc38_bec_cny", "btc38_ppc_cny", "btc38_anc_cny", "btc38_apc_cny", "btc38_unc_cny", "btc38_xpm_cny", "btc38_ric_cny", "btc38_src_cny", "btc38_tag_cny", "btc38_dgc_cny", "btc38_eac_cny", "btc38_vpn_cny", "btc38_xem_cny", "btc38_dash_cny", "btc38_emc_cny", "btc38_bts_btc", "btc38_doge_btc", "btc38_tmc_btc", "btc38_ncs_btc", "btc38_ltc_btc", "btc38_xrp_btc", "btc38_xem_btc", "btc38_xcn_btc", "btc38_voot_btc", "btc38_sys_btc", "btc38_nrs_btc", "btc38_med_btc", "btc38_eac_btc", "btc38_dash_btc", "btc38_emc_btc", "bter_eth_cny", "bter_ppc_cny", "bter_doge_cny", "bter_nxt_cny", "bter_nmc_cny", "bter_xcp_cny", "bter_qrk_cny", "bter_ftc_cny", "bter_xpm_cny", "bter_ifc_cny", "bter_vtc_cny", "bter_mec_cny", "bter_wdc_cny", "bter_max_cny", "bter_mint_cny", "bter_tix_cny", "bter_dvc_cny", "bter_zet_cny", "bter_dgc_cny", "bter_tips_cny", "bter_src_cny", "bter_red_cny", "bter_yac_cny", "bter_dtc_cny", "bter_cnc_cny", "bter_bqc_cny", "bter_btq_cny", "bter_dash_cny", "bter_dao_cny", "poloniex_eth_btc", "poloniex_etc_btc", "poloniex_doge_btc", "poloniex_bts_btc", "poloniex_xrp_btc", "poloniex_nxt_btc", "poloniex_blk_btc", "poloniex_wdc_btc", "poloniex_ppc_btc", "poloniex_xpm_btc", "poloniex_ric_btc", "poloniex_xem_btc", "poloniex_pts_btc", "poloniex_nmc_btc", "poloniex_xcp_btc", "poloniex_mint_btc", "poloniex_vtc_btc", "poloniex_mmc_btc", "poloniex_xcn_btc", "poloniex_sys_btc", "poloniex_dash_btc", "poloniex_fct_btc", "poloniex_ltc_btc", "poloniex_maid_btc", "poloniex_dgb_btc", "poloniex_str_btc", "poloniex_rdd_btc", "poloniex_btcd_btc", "poloniex_rby_btc", "poloniex_myr_btc", "poloniex_xmr_btc", "poloniex_bcn_btc", "poloniex_xmg_btc", "poloniex_vrc_btc", "poloniex_flt_btc", "poloniex_grc_btc", "poloniex_emc2_btc", "poloniex_bbr_btc", "poloniex_flo_btc", "poloniex_pink_btc", "poloniex_huc_btc", "poloniex_sync_btc", "poloniex_cga_btc", "poloniex_geo_btc", "poloniex_lsk_btc", "poloniex_dao_btc", "poloniex_sc_btc", "poloniex_amp_btc", "poloniex_steem_btc", "poloniex_sbd_btc", "poloniex_exp_btc", "bittrex_waves_btc", "bittrex_eth_btc", "bittrex_etc_btc", "bittrex_vox_btc", "bittrex_emc_btc", "bittrex_club_btc", "bittrex_xem_btc", "bittrex_nxt_btc", "bittrex_dash_btc", "bittrex_dao_btc", "bittrex_ltc_btc", "bittrex_lsk_btc", "bittrex_dgd_btc", "bittrex_doge_btc", "bittrex_sar_btc", "bittrex_bts_btc", "bittrex_xrp_btc", "bittrex_xlm_btc", "bittrex_blk_btc", "bittrex_mec_btc", "bittrex_ybc_btc", "bittrex_ppc_btc", "bittrex_dgc_btc", "bittrex_vpn_btc", "bittrex_sys_btc", "bittrex_xcp_btc", "bittrex_vtc_btc", "bittrex_fct_btc", "bittrex_maid_btc", "bittrex_dgb_btc", "bittrex_rdd_btc", "bittrex_btcd_btc", "bittrex_rby_btc", "bittrex_myr_btc", "bittrex_xmr_btc", "bittrex_xmg_btc", "bittrex_vrc_btc", "bittrex_grc_btc", "bittrex_bbr_btc", "bittrex_flo_btc", "bittrex_pink_btc", "bittrex_geo_btc", "bittrex_amp_btc", "bittrex_steem_btc", "bittrex_sbd_btc", "bittrex_exp_btc", "jubi_ifc_cny", "jubi_eac_cny", "jubi_doge_cny", "jubi_sak_cny", "jubi_plc_cny", "btc100_doge_cny", "btc100_ybc_cny", "btc100_ggp_cny", "btc100_cec_cny", "btc100_mxi_cny", "btc100_ktc_cny", "btc100_afc_cny", "btc100_kp_cny", "btc100_hcp_cny", "yunbi_bts_cny", "yunbi_eth_cny", "yunbi_dgd_cny", "yunbi_dcs_cny", "yunbi_sc_cny", "yunbi_pls_cny", "yunbi_dao_cny", "yunbi_etc_cny", "cnbtc_eth_cny", "kraken_eth_usd", "kraken_dao_usd", "kraken_etc_usd", "yuanbaohui_ybc_cny", "yuanbaohui_abc_cny", "yuanbaohui_trmb_cny", "yuanbaohui_doge_cny", "yuanbaohui_irc_cny", "yuanbaohui_fct_cny", "yuanbaohui_axf_cny", "yuanbaohui_vap_cny", "yuanbaohui_vpn_cny", "yuanbaohui_gooc_cny", "yuanbaohui_cic_cny", "yuanbaohui_rhc_cny", "yuanbaohui_xsi_cny", "yuanbaohui_yby_cny", "yuanbaohui_smc_cny", "yuanbaohui_mc_cny", "yuanbaohui_tmc_cny", "btc9_atc_cny", "btc9_wmc_cny", "btc9_dgg_cny", "btctrade_doge_cny", "dahonghuo_plp_cny", "dahonghuo_sak_cny", "dahonghuo_pnc_cny", "dahonghuo_xrp_cny"];
            return coinSymbolArr;
        }
        /**
         * 获取币标识
         * 
         * @returns 
         * @memberof SosoCoin
         */
    static coinSymbolType() {
        return {
            okcoinbtc: 'okcoin_btc_cny',
            okcoinltc: 'okcoin_ltc_cny',
            /**
             * 聚币网比特币
             */
            jubibtc: 'jubi_btc_cny',
            huobibtc: 'huobi_btc_cny',
        };
    }

    /**
     * KLine
     * 
     * @param {String} coinSymbol 
     * @memberof SosoCoin
     */
    kline(coinSymbol) {
        return initSid().then((sid) => {
            return httpHelper.request(`/do/direct/chart_data?step=1800&sid=${encodeURIComponent(sosoConfig.sid)}&symbol=${coinSymbol}&nonce=${new Date().getTime()}`)
        })
    }

    /**
     * 计算MA线
     * 
     * @param {number} dayCount 天
     * @param {Array} data 数据
     * @param {string} [defaultPrice='99999999999'] 
     * @param {number} [closingPriceIndex=6] 
     * @returns 
     */
    calculateMA(dayCount, data, defaultPrice = '99999999999', closingPriceIndex = 6) {
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

/**
 * logCoinOrder
 * 
 * @param {string} thatCoinSymbol 
 * @param {number} [money=10000] 
 * @param {number} [closingPriceIndex=6] 收盘价索引 
 */
function logCoinOrder(thatCoinSymbol, money = 10000, closingPriceIndex = 6) {
    let holdCoin = new HoldCoin(thatCoinSymbol, 0);
    let account = new Account(money, holdCoin);
    let sosoCoin = new SosoCoin();
    return sosoCoin.kline(thatCoinSymbol).then((res, err) => {
        let logFileName = `/sosocoinlog/${thatCoinSymbol}${moment().format('YYYYMMDDHHmm')}.log`;
        if (res.indexOf('err-code') > -1) {
            Logger.log(res, logFileName);
            return CommonResult.error(res);
        }
        let data;
        try {
            data = JSON.parse(res);
        } catch (error) {
            Logger.log(`获取结果:${res}`, logFileName);
            Logger.log(`错误:${error}`)
            return CommonResult.error('' + error);
        }
        let dayCount = 30;
        let maData = sosoCoin.calculateMA(dayCount, data);
        data.forEach((value, index) => {
            let thatDate = moment(moment.unix(value[0])).format('YYYY-MM-DD HH:mm:ss SSS')
            value[0] = thatDate;
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
                        let tempRateAmt = sosoCoin.calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
                        if (tempMoney + tempRateAmt > account.money) {
                            tempCount = Math.round(((account.money - tempRateAmt) / value[closingPriceIndex]) * 100) / 100;
                            let tempMoney = (value[closingPriceIndex] * tempCount);
                            tempRateAmt = sosoCoin.calcRate(thatCoinSymbol, 1, tempCount, tempMoney);
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
                        let tempRateAmt = sosoCoin.calcRate(thatCoinSymbol, 2, tempCount, tempMoney);
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
        return CommonResult.success({
            coinSymbol: thatCoinSymbol,
            ogMoney: money,
            nowMoney: account.money,
            coinCount: account.holdCoin.count
        });
    });
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            resolve()
        }, ms);
    })
}

async function logAll() {
    await initSid();
    let totalOgMoney = 0,
        totalNowMoney = 0;
    let holdCoinArr = [];
    let failedMessageArr = [];
    for (let i = 0; i < SosoCoin.coinSymbols().length; i++) {
        let coinSymbol = SosoCoin.coinSymbols()[i];
        console.log(`coinSymbol:${coinSymbol},执行${i+1}...`);
        let result = await logCoinOrder(coinSymbol);
        if (result.result) {
            if (result.data.coinCount == 0) {
                totalOgMoney += result.data.ogMoney;
                totalNowMoney += result.data.nowMoney;
                if (result.data.nowMoney - result.data.ogMoney < 0) {
                    Logger.log(`亏损货币：${coinSymbol},亏损金额：￥${(result.data.ogMoney-result.data.nowMoney).toFixed(2)}`)
                }
            } else {
                holdCoinArr.push({
                    coinSymbol: result.data.coinSymbol,
                    coinCount: result.data.coinCount
                });
            }
        } else {
            failedMessageArr.push(result.message)
        }
    }
    let PL = totalNowMoney - totalOgMoney;
    if (PL > 0) {
        Logger.log(`总耗资￥${totalOgMoney.toFixed(2)},赚了￥${PL.toFixed(2)},持币：${JSON.stringify(holdCoinArr)}`, `/sosocoinlog/0000-logAll-${moment().format('YYYYMMDDHHmm')}.log`)
    } else {
        Logger.log(`总耗资￥${totalOgMoney.toFixed(2)},亏了￥${(-PL).toFixed(2)},持币：${JSON.stringify(holdCoinArr)}`, `/sosocoinlog/0000-logAll-${moment().format('YYYYMMDDHHmm')}.log`)
    }
}
logAll();