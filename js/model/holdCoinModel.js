class HoldCoin {
    /**
     * Creates an instance of HoldCoin.
     * @param {String} symbol 标识
     * @param {Number} [count=0] 数量，默认0
     * @memberof HoldCoin
     */
    constructor(symbol, count = 0) {
        this.symbol = symbol;
        this.count = count;
    }
}

module.exports = HoldCoin;