/**
 * Ticker script
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
        var response = {embed: coinmarketcapPrice}
      } else {
        var response = '**$' + symbol + '** was not found on CoinMarketCap!'
      }
    } else if (marketName && marketName.toUpperCase() === 'BINANCE') {
      const binancePrice = await market.getBinanceEmbeddedContent(
        symbol,
        tradePair
      )
      if (binancePrice) {
        var response = {embed: binancePrice}
      } else {
        var response = '**$' + symbol + '** was not found on Binance with given trade pair!'
      }
    }
  } catch (error) {
    console.error(error)
  }

  return response
}

module.exports.tickerfunc = tickerfunc
