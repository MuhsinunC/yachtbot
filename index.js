/**
 * index.js
 *
 * Application entry point.
 */

const https = require('https');
const cc = require('cryptocompare');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
global.fetch = require('node-fetch');

/*
 * Runs when bot is connected. 
 *
 */
client.on('ready', () => {
  console.log('Bot is ready!');
});

/*
 * Parses a user message and responds to it accordingly.
 */
client.on('message', message => {
  //console.log(message.content);
  m = message.content;
  if (m === 'fuck') {
    message.reply('fuck me daddy');
  }
  else if (m.includes("$")){
    var response = getMarketValue(m.replace("$",""));
    response.then(function(result){
      var msg = m + ": " + result
      message.reply(msg);
    });
  }
});

/**
 * Gets the current market value for any currency..
 * @method getMarketValue
 * @return {Promise}
 */
async function getMarketValue(ticker) {
  try {
    // fetch crypto pricings
    const VAL = await cc.price(ticker, ['USD']);
    return VAL.USD;
  } catch (error) {
    throw new Error('error during POST', error);
  }
}

// Make the bot login to the server
client.login(config.secret);
