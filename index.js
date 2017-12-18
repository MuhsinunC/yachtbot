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

// parse user messages and respond accordingly
client.on('message', message => {
  const content = message.content;

  if (content === 'fuck') {
    message.reply('fuck me daddy');
  } else if (content.includes('$')) {
    const response = getMarketValue(content.replace('$', ''));

    response.then(result => {
      const reply = `${content}: ${result}`;
      message.reply(reply);
    }).catch((error) =>{
      // Leave this blank as the error is pointless.
    });
  }
});

/**
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH.
 * @return {Number} - The price of the ticker in USD.
 */
async function getMarketValue(ticker) {
  try {
    // fetch crypto pricings
    const VAL = await cc.price(ticker, ['USD']);
    return VAL.USD;
  } catch (error) {
    throw new Error(error);
  }
}

// make the bot login to the server
try {
  client.login(config.secret);
} catch (error) {
  throw new Error('bot failed to login', error);
}
