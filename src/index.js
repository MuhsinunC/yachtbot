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
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Z]{3,4}$/gi
    const fuckRegex = /^f+u+c+k+$/gi

    if (content.match(fuckRegex)) {
      message.reply('fuck me daddy')
    } else if (content.match(tickerRegex)) {
      const response = await getMarketValue(content)
      const reply = response
        ? `**${content.toUpperCase()}**: $${response}`
        : `**${content.toUpperCase()}** was not found!`
      message.reply(reply)
    }
  } catch (error) {
    console.error(error)
  }
})

/**
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH or ETH. Case
 * insensitive.
 * @return {Number} - The price of the ticker in USD.
 */
async function getMarketValue (ticker) {
  try {
    // remove the $ from the ticker
    if (ticker.includes('$')) ticker.replace('$', '')

    // fetch crypto pricings
    const VAL = await cc.price(ticker.toUpperCase(), ['USD'])
    return VAL.USD
  } catch (error) {
    console.error(error)
  }
}

// make the bot login to the server
const login = async () => {
  try {
    client.login(config.secret)
    console.info('bot has logged in')
  } catch (error) {
    console.error('bot failed to login', error)
  }
}

login()
