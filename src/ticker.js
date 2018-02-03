/**
 * Run simple trade simulator for bot
 * @method ticker
 * @param {String} content - content of message to be parsed
 * @return {String} - A response from trade simulator
 *
 */

const market = require('./market')

const tickerfunc = async function (content) {

  let tradePair = null
  let marketName = null

  const symbolAndTradePairMarket = content.replace('$', '').split(' ')
  const symbol = symbolAndTradePairMarket[0].toUpperCase()

  let response = ''

  try {

    if (symbolAndTradePairMarket[2]) {
      tradePair = symbolAndTradePairMarket[1]
      marketName = symbolAndTradePairMarket[2]
    } else if (!symbolAndTradePairMarket[2] && symbolAndTradePairMarket[1]) {
      tradePair = symbolAndTradePairMarket[1]
    }
    if (market.marketLists.hasOwnProperty(tradePair)) {
      marketName = tradePair
      tradePair = null
    }
    // first send CMC since it's pretty instant
    if (!marketName || marketName.toUpperCase() === 'CMC') {
      const coinmarketcapPrice = await market.getCoinmarketcapEmbeddedContent(symbol)
      if (coinmarketcapPrice) {
        console.log(coinmarketcapPrice);
        response += { embed: coinmarketcapPrice }
      } else {
        response += '**$' + {symbol} + '** was not found on CoinMarketCap!'
      }
    } else if (marketName && marketName.toUpperCase() === 'BINANCE') {
      const binancePrice = await market.getBinanceEmbeddedContent(
        symbol,
        tradePair
      )
      if (binancePrice) {
        response += { embed: binancePrice }
      } else {
        response += '**$' + {symbol} + '** was not found on Binance with given trade pair!'
      }
    }

  } catch (error) {
    console.error(error)
  }

  str = JSON.stringify(response, null, 4); // (Optional) beautiful indented output.
  console.log(response); // Logs output to dev tools console.
  console.log(str);
  return response

}

module.exports.tickerfunc = tickerfunc
