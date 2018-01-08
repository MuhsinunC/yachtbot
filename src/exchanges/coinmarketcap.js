/**
 * coinmarketcap.js
 *
 * Gets the current market value for any currency from coin market cpa.
 */

const Coinmarketcap = require('node-coinmarketcap-api')
const coinmarketcap = new Coinmarketcap()

const getCoinStats = async symbol => {
  try {
    const response = await coinmarketcap.ticker()
    return response.find(coin => coin.symbol === symbol)
  } catch (error) {
    console.error(error)
    return null
  }
}
module.exports.getCoinStats = getCoinStats
