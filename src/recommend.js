const exchanges = require('./exchanges')


const recommendCoin = async symbol => {
  // get price from coin market cap and return as object
  try {
    const stonks = await exchanges.coinmarketcap.get100CoinStats("all");
    console.log(stonks);

    return generateRecommendation(stonks);
  } catch (error) {
    console.error(error)
    return null
  }
}

const recommendAllCoins = async symbol => {
  // get price from coin market cap and return as object
  try {
    const stonks = await exchanges.coinmarketcap.getAllCoinStats("all");
    console.log(stonks);

    return generateRecommendation(stonks);
  } catch (error) {
    console.error(error)
    return null
  }
}

const generateRecommendation = function(coinJSON){
  var lowestRatio = 90000000000; //lowest MC to vol ratio
  var ratioDictionary = {};
  // console.log(coinJSON);
  for (coin in coinJSON){
    // console.log("Coin: " + coin['symbol']);
    // console.log(coin);
    let coinRatio = parseFloat(coinJSON[coin].market_cap_usd) / parseFloat(coinJSON[coin]['24h_volume_usd']);
    if(coinRatio < lowestRatio){
      lowestRatio = coinRatio;
    }

    ratioDictionary[coinRatio] = coinJSON[coin].symbol;
  }
  return ratioDictionary[lowestRatio];
}

module.exports = {
  recommendCoin,
  recommendAllCoins
}
