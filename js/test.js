// let OkCoinApi = require('./okcoin')

// let okcoinApi = new OkCoinApi('789a567d-84f6-47fb-af75-3ef9f2013d4c', 'C601FBECF64B0309ED4F1E4A1BD00514');
// // okcoinApi.ticker();
// // okcoinApi.depth();
// // okcoinApi.trades();
// // okcoinApi.kline();
// okcoinApi.userinfo();
// // okcoinApi.account_records();

// let HttpHelper = require('./helper/httpHelper')

// let httpHelper = new HttpHelper('tstapp.360kad.com', 443);
// httpHelper.request('/Login', 'get').then((res, err) => {
//     console.log(res);
// })

// let cacheHelper = require('./helper/cacheHelper')
// let cacheKey = 'test';
// cacheHelper.set(cacheKey, { a: 'ttttt', b: 1, c: false, d: true, e: { a: '111' } }, 2);
// let cacheInfo = cacheHelper.get(cacheKey);
// console.log(cacheInfo);
let Logger = require('./helper/logHelper')
Logger.log('test', '/test/test/test/test/test/test.log')