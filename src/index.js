/**
 * index.js
 *
 * Application entry point.
 */

const cc = require('cryptocompare')
const Discord = require('discord.js')
const client = new Discord.Client()
global.fetch = require('node-fetch')

const config = require('../config')

// indicate bot is connected
client.on('ready', () => {
  console.log('Bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', message => {
  const content = message.content
  const tickerRegex = /^[$A-Z]{4}$/gi

  if (content === 'fuck') {
    message.reply('fuck me daddy')
  } else if (content.match(tickerRegex)) {
    const response = getMarketValue(content.replace('$', ''))

    response.then(result => {
      const reply = `${content}: ${result}`
      message.reply(reply)
    })
  }
})

/**
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH.
 * @return {Number} - The price of the ticker in USD.
 */
async function getMarketValue (ticker) {
  try {
    // fetch crypto pricings
    const VAL = await cc.price(ticker.toUpperCase(), ['USD'])
    return VAL.USD
  } catch (error) {
    throw new Error(error)
  }
}

// make the bot login to the server
try {
  client.login(config.secret)
} catch (error) {
  throw new Error('bot failed to login', error)
}
