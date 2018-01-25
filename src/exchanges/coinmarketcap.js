/**
 * coinmarketcap.js
 *
 * Gets the current market value for any currency from coin market cpa.
 */

const Coinmarketcap = require('node-coinmarketcap-api')
const coinmarketcap = new Coinmarketcap()

const getCoinStats = async symbol => {
  try {
    const response = await coinmarketcap.ticker() // todo: input ticker in ticker
    return response.find(coin => coin.symbol === symbol)
  } catch (error) {
    console.error(error)
    return null
  }
}

const getAllCoinStats = async symbol => {
  try {
    const response = await coinmarketcap.ticker() // todo: input ticker in ticker
    return response
  } catch (error) {
    console.error(error)
    return null
  }
}

const get100CoinStats = async symbol => {
  try {
    const response = await coinmarketcap.ticker(null, null, 100) // todo: input ticker in ticker
    return response
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports.getCoinStats = getCoinStats
module.exports.getAllCoinStats = getAllCoinStats
module.exports.get100CoinStats = get100CoinStats
