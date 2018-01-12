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
const trade = require ('./trade')
const predict = require('./predict')

// indicate bot is connected
client.on('ready', () => {
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Z]{3,4}$/gi
    const fuckRegex = /^f+u+c+k+$/gi
    const shitRegex = /^s+h+i+t+$/gi
    const tradeRegex = /^t+r+a+d+e/gi
    const predictRegex = /^p+r+e+d+i+c+t\s[$][A-Z]{3,4}$/gi

    if (content.match(fuckRegex)) {
      console.log(fuck.cmds);
      message.reply(fuck.cmds.fuck())
    } else if (content.match(tickerRegex)) {
      const response = await market.getMarketValue(content.replace('$', ''))
      const reply = response
        ? `**${content.toUpperCase()}**: $${response}`
        : `**${content.toUpperCase()}** was not found!`
      console.log(response);
      message.reply(reply)
    } else if(content.match(tradeRegex)) {
      const response = await trade.tradeSimulator(content)
    console.log(response)
			message.reply(response)
    }else if(content.match(shitRegex)) {
      message.reply(fuck.cmds.shit())
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
