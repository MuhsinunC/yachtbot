/**
 * index.js
 *
 * Application entry point.
 */

const Discord = require('discord.js')
const client = new Discord.Client()
global.fetch = require('node-fetch')

const config = require('./config')
const replies = require('./replies')
const market = require('./market')
const trade = require('./trade')
const ticker = require('./ticker')
const recommend = require('./recommend')
const predict = require('./predict')

// indicate bot is connected
client.on('ready', () => {
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Za-z ]{1,}$/i
    const helpRegex = /^h+e+l+p$/gi
    const fuckRegex = /^f+u+c+k$/gi
    const fuckyouRegex = /^f+u+c+k\sy+o+u$/gi
    const bitchRegex = /^b+i+t+c+h/gi
    const shitRegex = /^s+h+i+t$/gi
    const assholeRegex = /^a+s+s+h+o+l+e/gi
    const tradeRegex = /^t+r+a+d+e/gi
    const recommendRegex = /^r+e+c+o+m+m+e+n+d$/gi
    const recommendAllRegex = /^r+e+c+o+m+m+e+n+d\sa+l+l$/gi
    const predictRegex = /^p+r+e+d+i+c+t\s[$][A-Z]{3,4}$/gi

    if (content.match(fuckRegex)) {
      message.reply(replies.cmds.fuck())
    } else if (content.match(tickerRegex)) {
      const response = await ticker.tickerfunc(content)
      console.log(response)
      message.reply(response)
    } else if (content.match(tradeRegex)) {
      const response = await trade.tradeSimulator(content)
      console.log(response)
      message.reply(response)
    } else if (content.match(helpRegex)) {
      message.reply(replies.cmds.help())
    } else if (content.match(bitchRegex)) {
      message.reply(replies.cmds.bitch())
    } else if (content.match(shitRegex)) {
      message.reply(replies.cmds.shit())
    } else if (content.match(assholeRegex)) {
      message.reply(replies.cmds.asshole())
    } else if (content.match(fuckyouRegex)) {
      message.reply(replies.cmds.fuckyou())
    } else if (content.match(recommendAllRegex)) {
      const response = await recommend.recommendAllCoins('all')
      message.reply(response)
    } else if (content.match(recommendRegex)) {
      const response = await recommend.recommendCoin('all')
      message.reply(response)
    } else if (content.match(predictRegex)) {
      const ticker = content.replace('predict ', '')
      const response = await market.getMarketValue(content.replace('predict $', ''))
      message.reply(ticker + ' prediction: ' + predict.predict.predict(response) +
      '   current: ' + response)
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
