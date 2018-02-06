/**
 * market.js
 * Gets crypto prices from exchanges and returns result as Object
 * for Discord Rich Embedded Message
 */
const exchanges = require('./exchanges')
//
const marketLists = {
  cmc: 'cmc',
  binance: 'binance',
  cc: 'cryptocompare'
}
/**
 * extracts trading pair and symbol i.e
 * $ETHBTC - ETH BTC
 * $ETHUSD - ETH USD
 * $LINK
 */

const Discord = require('discord.js')

const extractTradePairAndSymbol = (symbol, tradePair) => {
  if (symbol) {
    symbol = symbol.toUpperCase()
  }
  if (tradePair) {
    tradePair = tradePair.toUpperCase()
  }
  // ETHETH or BTCBTC is an invalid trade pair
  if (
    (tradePair !== symbol && tradePair === 'USD') ||
    !tradePair ||
    (symbol !== 'BTC' && symbol === tradePair)
  ) {
    tradePair = 'BTC'
  } else if (symbol === 'BTC') {
    tradePair = 'USDT'
  }
  return {
    tradeSymbol: symbol,
    tradePair
  }
}

/**
 * We need to get the global average as well as current price from Binance
 * Binance doesn't provide price in USD so we need to get Binance BTC in USD
 * And calculate USD by (TRADING_PAIR_USD_PRICE * TRADING_PAIR_ALTCOIN_PRICE) i.e (ETH_USD * VEN_ETH)
 * Note: We need to make 2 Binance call for everything but the trading pairs. 1 CMC call for global average
 */
const getPriceFromBinance = async (symbol, pair) => {
  try {
    let binancePrice = {}
    // Binance requires a trading pair to pull in price i.e VENETH
    let { tradeSymbol, tradePair } = extractTradePairAndSymbol(symbol, pair)
    if (tradeSymbol === 'BTC') {
      // we need to make only one call if it's BTC
      binancePrice = await exchanges.binance.getCoinStats(
        tradeSymbol + tradePair
      )
      binancePrice['tradePair'] = 'USDT'
    } else {
      // 1 call to get symbol price in provided pair
      let bnbSymbolPrice = await exchanges.binance.getCoinStats(
        tradeSymbol + tradePair
      )
      // if and only if the coin with given symbol exist on binance
      // find it's pair price to calculate to USD
      if (bnbSymbolPrice) {
        // 1 call to get current tradePair price to get accurate USD value
        let bnbTradePair = await exchanges.binance.getCoinStats(
          tradePair + 'USDT'
        )

        // insert tradePairPrice (USD)
        bnbSymbolPrice['tradePairPrice'] = bnbTradePair['lastPrice']
        bnbSymbolPrice['tradePair'] = tradePair
        binancePrice = bnbSymbolPrice
      } else {
        // sometimes a coin/pair might not exist on binance in that case don't continue
        return null
      }
    }
    // insert symbols and pairs for URL since binance doesn't provide this
    binancePrice['symbol'] = tradeSymbol
    // get beautified objects for discord and return
    return binancePrice
  } catch (error) {
    console.error(error)
  }
}

/**
 * Gets price from Coin Market Cap
 */
const getPriceFromCoinMarketCap = async symbol => {
  // get price from coin market cap and return as object
  try {
    return await exchanges.coinmarketcap.getCoinStats(symbol)
  } catch (error) {
    console.error(error)
    return null
  }
}

const getAllPricesFromCoinMarketCap = async symbol => {
  // get price from coin market cap and return as object
  try {
    return await exchanges.coinmarketcap.getCoinStats()
  } catch (error) {
    console.error(error)
    return null
  }
}

const priceInUSD = (pairPrice, ownPrice) => (pairPrice * ownPrice).toFixed(4)
/**
 *
 * Generates embedded object from CMC data for Discord
 */
const getCoinmarketcapEmbeddedContent = async symbol => {
  const cmc = await getPriceFromCoinMarketCap(symbol)
  if (cmc) {
    const result = new Discord.RichEmbed()
      .setTitle('__' + cmc.name + ' (**' + cmc.symbol + '**)__  (Rank ' + cmc.rank + ')')
      .setURL('https://coinmarketcap.com/currencies/' + cmc.name.replace(/\s+/g, '-') + '/')
      .setDescription('Global Average Price: **$' + cmc.price_usd + '** USD | **' + cmc.price_btc + '** BTC')
      .setThumbnail('https://files.coinmarketcap.com/static/img/coins/128x128/' + cmc.name.replace(/\s+/g, '-').toLowerCase() + '.png')
      .setColor(parseFloat(cmc.percent_change_24h) < 0 ? 10958133 : 5943124)
      .addField('Price Change', '**' + cmc.percent_change_1h + '**% 1h | **' + cmc.percent_change_24h + '**% 24h', true)
      .addField('Market Cap', '$' + parseFloat(cmc.market_cap_usd).toFixed(2), true)
      .addField('Volume (24h)', '$' + parseFloat(cmc['24h_volume_usd']).toFixed(2), true)
      .setFooter('Results from CoinMarketCap')
    return result
  }
  return null
}
/**
 *
 * Generates embedded object from Binance data for Discord
 */
const getBinanceEmbeddedContent = async (symbol, tradePair) => {
  const binance = await getPriceFromBinance(symbol, tradePair)
  // Sometimes there's no binance result so we won't create that field
  let description = ''
  let priceChange = ''
  let movement = ''
  let volume = ''
  if (binance) {
    if (binance.tradePairPrice) {
      description = `**$${priceInUSD(
        binance.tradePairPrice,
        binance.lastPrice
      )}** USD | **${parseFloat(binance.lastPrice).toFixed(8)}** ${
        binance.tradePair
      }`

      priceChange = `**$ ${priceInUSD(
        binance.tradePairPrice,
        binance.priceChange
      )}** USD | **${parseFloat(binance.priceChange).toFixed(8)}** ${
        binance.tradePair
      } | **${binance.priceChangePercent}**%`

      movement = `**High**: $${priceInUSD(
        binance.tradePairPrice,
        binance.highPrice
      )} USD / ${parseFloat(binance.highPrice).toFixed(6)} ${
        binance.tradePair
      } | **Low**: $${priceInUSD(
        binance.tradePairPrice,
        binance.lowPrice
      )} USD / ${parseFloat(binance.lowPrice).toFixed(6)} ${binance.tradePair}`

      volume = `${binance.quoteVolume} ${binance.tradePair}`
    } else {
      description = `**$${parseFloat(binance.lastPrice).toFixed(4)}** USD`
      priceChange = `**$ ${parseFloat(binance.priceChange).toFixed(
        4
      )}** USD | **${binance.priceChangePercent}**%`
      movement = `**High**: $${parseFloat(binance.highPrice).toFixed(
        4
      )} USD | **Low**: $${parseFloat(binance.lowPrice).toFixed(4)} USD`
      volume = `$${binance.quoteVolume} USD`
    }

    const cmc = await getPriceFromCoinMarketCap(symbol)

    const binanceField = new Discord.RichEmbed()
      .setTitle('__**' + binance.symbol + ' on Binance**__')
      .setURL('https://www.binance.com/trade.html?symbol=' + binance.symbol + '_' + binance.tradePair)
      .setDescription(description)
      .setThumbnail('https://files.coinmarketcap.com/static/img/coins/128x128/' + cmc.name.replace(/\s+/g, '-').toLowerCase() + '.png')
      .setColor(parseFloat(binance.priceChangePercent) < 0 ? 10958133 : 5943124)
      .addField('Price Change (24h)', priceChange, true)
      .addField('Movement (24h)', movement, true)
      .addField('Volume (24h)', volume, true)
      .setFooter('Results from Binance')

    return binanceField
  } else {
    return null
  }
}

/**
 * market.js
 *
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH.
 * @return {Number} - The price of the ticker in USD.
 */
const cc = require('cryptocompare')

async function getMarketValue (ticker) {
  try {
    // fetch crypto pricings
    const VAL = await cc.price(ticker.toUpperCase(), ['USD'])
    return VAL.USD
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  getMarketValue,
  marketLists,
  getPriceFromCoinMarketCap,
  getPriceFromBinance,
  getCoinmarketcapEmbeddedContent,
  getBinanceEmbeddedContent
}
