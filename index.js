/**
 * index.js
 *
 * Application entry point.
 */

const https = require('https');
const cc = require('cryptocompare');
const Discord = require('discord.js');
const client = new Discord.Client();
global.fetch = require('node-fetch');

const config = require('./config');

// indicate bot is connected
client.on('ready', () => {
  console.log('Bot is ready!');
});

/**
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH.
 * @return {Promise} - The price of the ticker in USD.
 */
async function getMarketValue(ticker) {
  try {
    // fetch crypto pricings in US dollars
    const VAL = await cc.price(ticker, ['USD']);
    return VAL.USD;
  } catch (error) {
    throw new Error(error);
  }
}

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content;

    if (content === 'fuck') {
      message.reply('fuck me daddy');
    } else if (content.includes('$')) {
      const response = await getMarketValue(content.replace('$', ''));

      const reply = `${content}: ${response}`;
      message.reply(reply);
    }
  } catch (error) {
    throw new Error(error);
  }
});

// make the bot login to the server
try {
  client.login(config.secret);
  console.log('bot has successfully logged in');
} catch (error) {
  throw new Error('bot failed to login', error);
}
