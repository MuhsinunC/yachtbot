const https = require('https');
const querystring = require('querystring');
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

const sampleData = {
  name: 'crypto webhook - syed',
  channel_id: '390389607315013633',
  token:
    '3d89bb7572e0fb30d8128367b3b1b44fecd1726de135cbe28a41f8b2f777c372ba2939e72279b94526ff5d1bd4358d65cf11',
  avatar: null,
  guild_id: '199737254929760256',
  id: '223704706495545344',
  user: {
    username: 'test',
    discriminator: '7479',
    id: '190320984123768832',
    avatar: 'b004ec1740a63ca06ae2e14c5cee11f3',
  },
  content: 'test from node',
};

req.write(JSON.stringify(sampleData));
req.end();

/**
 * Gets the current market value for Ethereum.
 * @method getETHMarketValue
 * @return {undefined}
 */
async function getETHMarketValue() {
  try {
    const ETH_VAL = await cc.price('ETH', ['USD']);
    req.write(ETH_VAL);
  } catch (error) {
    throw new Error(error);
  }
}

// getETHMarketValue();
