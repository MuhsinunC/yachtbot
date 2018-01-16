/**
 * index.js
 *
 * Application entry point.
 */

const Discord = require('discord.js')
const client = new Discord.Client()
global.fetch = require('node-fetch')

const config = require('./config')
const fuck = require('./fuck')
const market = require('./market')
const trade = require('./trade')
const recommend = require('./recommend');
const predict = require('./predict');

// indicate bot is connected
client.on('ready', () => {
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Za-z ]{1,}$/i
    const fuckRegex = /^f+u+c+k+$/gi
    const shitRegex = /^s+h+i+t+$/gi
    const tradeRegex = /^t+r+a+d+e/gi
    const bitchRegex = /^b+i+t+c+h/gi
    const recommendRegex = /^r+e+c+o+m+m+e+n+d+$/gi
    const recommendAllRegex = /^r+e+c+o+m+m+e+n+d\sa+l+l$/gi
    const predictRegex = /^p+r+e+d+i+c+t\s[$][A-Z]{3,4}$/gi

    if (content.match(fuckRegex)) {
      console.log(fuck.cmds)
      message.reply(fuck.cmds.fuck())
    } else if (content.match(tickerRegex)) {
      let tradePair = null
      let marketName = null

      const symbolAndTradePairMarket = content.replace('$', '').split(' ')
      const symbol = symbolAndTradePairMarket[0].toUpperCase()

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
        const coinmarketcapPrice = await market.getCoinmarketcapEmbeddedContent(
          symbol
        )
        if (coinmarketcapPrice) {
          console.log(coinmarketcapPrice);
          message.reply({ embed: coinmarketcapPrice })
        } else {
          message.reply(`**${symbol}** was not found on CoinMarketCap!`)
        }
      } else if (marketName && marketName.toUpperCase() === 'BINANCE') {
        const binancePrice = await market.getBinanceEmbeddedContent(
          symbol,
          tradePair
        )
        if (binancePrice) {
          message.reply({ embed: binancePrice })
        } else {
          message.reply(
            `**${symbol}** was not found on Binance with given trade pair!`
          )
        }
      }
    } else if (content.match(tradeRegex)) {
      const response = await trade.tradeSimulator(content)
      console.log(response)
      message.reply(response)
    } else if (content.match(bitchRegex)) {
      message.reply(fuck.cmds.bitch())
    } else if (content.match(shitRegex)) {
      message.reply(fuck.cmds.shit())
    }else if(content.match(recommendAllRegex)){
      const response = await recommend.recommendAllCoins("all");
      message.reply(response);
    }
    else if(content.match(recommendRegex)){
      const response = await recommend.recommendCoin("all");
      message.reply(response);
    }else if(content.match(predictRegex)){
      const ticker = content.replace('predict ', '');
      const response = await market.getMarketValue(content.replace('predict $', ''));
      message.reply(ticker + " prediction: " + predict.predict.predict(response) +
      "   current: " + response);
    }
  } catch (error) {
    console.error(error)
  }
})

// make the bot login to the server
try {
  client.login(config.secret)
  console.info('bot has logged in')
} catch (error) {
  console.error('bot failed to login', error)
}
