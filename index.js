/**
 * Entry point.
 */

const https = require('https');
const cc = require('cryptocompare');
global.fetch = require('node-fetch');

const config = require('./config');

const options = {
  hostname: 'discordapp.com',
  path: config.webhooks.cryptopricing.dev,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * The in-progress request ready to be executed.
 * @type {http.ClientRequest}
 */
const req = https.request(options, res => {
  if (res.statusCode === 200 || res.statusCode === 204) {
    console.log(`Status: ${res.statusCode}`, 'Post successful!');
  }

  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

/**
 * Gets the current market value for Ethereum.
 * @method getETHMarketValue
 * @return {undefined}
 */
async function getETHMarketValue() {
  try {
    // fetch crypto pricings
    const ETH_VAL = await cc.price('ETH', ['USD']);
    // prepare data
    const requestData = {
      content: `$ETH: ${ETH_VAL['USD']}`,
    };

    // send POST to Discord
    req.write(JSON.stringify(requestData));
    req.end();
  } catch (error) {
    throw new Error('error during POST', error);
  }
}

getETHMarketValue();
