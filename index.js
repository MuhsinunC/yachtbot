const https = require('https');
const cc = require('cryptocompare');
global.fetch = require('node-fetch');

const config = require('./config');

const options = {
  hostname: 'discordapp.com',
  path: config.webhooks.cryptopricing,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', error => {
  console.log(error);
});

/**
 * Gets the current market value for Ethereum.
 * @method getETHMarketValue
 * @return {undefined}
 */
async function getETHMarketValue() {
  try {
    const ETH_VAL = await cc.price('ETH', ['USD']);
    console.log(ETH_VAL['USD']);
    const requestData = {
      content: 'Bitcoin: $707.57',
    };
    req.write(JSON.stringify(requestData));
    req.end();
  } catch (error) {
    throw new Error(error);
  }
}

getETHMarketValue();
