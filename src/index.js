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

// indicate bot is connected
client.on('ready', () => {
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Z]{3,7}$/gi
    const fuckRegex = /^f+u+c+k+$/gi
    const shitRegex = /^s+h+i+t+$/gi
    const tradeRegex = /^t+r+a+d+e/gi
    const bitchRegex = /^b+i+t+c+h/gi

    if (content.match(fuckRegex)) {
      console.log(fuck.cmds)
      message.reply(fuck.cmds.fuck())
    } else if (content.match(tickerRegex)) {
      const symbolAndTradePair = content.replace('$', '').toUpperCase()
      // first send CMC since it's pretty instant
      const coinmarketcapPrice = await market.getPriceFromCoinMarketCap(
        symbolAndTradePair
      )
      if (coinmarketcapPrice) {
        message.reply({ embed: coinmarketcapPrice })
      } else {
        message.reply(
          `**${symbolAndTradePair.toUpperCase()}** was not found on CoinMarketCap!`
        )
      }
      const binancePrice = await market.getPriceFromBinance(symbolAndTradePair)
      if (binancePrice) {
        message.reply({ embed: binancePrice })
      } else {
        message.reply(
          `**${symbolAndTradePair.toUpperCase()}** was not found on Binance!`
        )
      }
    } else if (content.match(tradeRegex)) {
      const response = await trade.tradeSimulator(content)
      console.log(response)
      message.reply(response)
    } else if (content.match(bitchRegex)) {
      message.reply(fuck.cmds.bitch())
    } else if (content.match(shitRegex)) {
      message.reply(fuck.cmds.shit())
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
