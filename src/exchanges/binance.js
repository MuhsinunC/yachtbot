/**
 * binance.js
 *
 * Gets the current market value for any currency.
 */

const Binance = require('binance-api-node').default
const binanceClient = new Binance()
const getCoinStats = async symbol => {
  try {
    return await binanceClient.dailyStats({ symbol: symbol })
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports.getCoinStats = getCoinStats
