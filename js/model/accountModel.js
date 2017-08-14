 class Account {
     /**
      * Creates an instance of Account.
      * @param {number} money 
      * @param {HoldCoin} holdCoin 
      * @memberof Account
      */
     constructor(money, holdCoin) {
         this.money = money;
         this.holdCoin = holdCoin;
     }
 }

 module.exports = Account;