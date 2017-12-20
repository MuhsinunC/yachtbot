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
    const betRegex = /^bet$/gi

    if (content.match(fuckRegex)) {
      message.reply('fuck me daddy')
    } else if (content.match(tickerRegex)) {
      const tickerValueInUSD = await getMarketValue(content)
      // reply with ticker market value
      const reply = tickerValueInUSD
        ? `**${content.toUpperCase()}**: $${tickerValueInUSD}`
        : `**${content.toUpperCase()}** was not found!`
      message.reply(reply)
    } else if (content.match(betRegex)) {
      // requirements:
      // user can type "bet $BTC increases 5% tomorrow"
      // user can type "bet $BTC +5% tomorrow"
      // user can type "bet $ETH decreases 2% tomorrow"
      // user can type "bet $ETH -2% tomorrow"
      // bot broadcasts the bet
      // only accept 24 hours right now (tomorrow)
      // can make max 3 bets at any given time
      // gives or takes away 1 point from users depending on bet results
      // store user's points in a db
      const ticker = '$BTC'
      const betPercentChange = -5
      const betCloseTimeInMs = 8.64E7
      const originalTickerValueInUSD = await getMarketValue(ticker)

      // broadcast
      message.reply(`${message.author} has bet that ${ticker} will change by ${betPercentChange}% tomorrow!`)

      // evaluate bet after duration expiration
      client.setTimeout((betPercentChange, originalTickerValueInUSD) => {
        const currentTickerValueInUSD = await getMarketValue(ticker)
        const currentPercentChange = (originalTickerValueInUSD - currentTickerValueInUSD) / originalTickerValueInUSD

        // check if ticker value matches bet
        // provide 2% padding/error-margin
        if ((Math.abs(betPercentChange - currentPercentChange)) <= 2) {
          // increment points in db
        } else {
          // decrement points in db
        }
      }, betCloseTimeInMs)
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
    if (ticker.includes('$')) ticker = ticker.replace('$', '')

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
