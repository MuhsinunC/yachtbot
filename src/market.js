/**
 * market.js
 * Gets cypto prices from exchanges and returns result as Object
 * for Discord Rich Embedded Message
 */
const exchanges = require("./exchanges");

/**
 * extracks trading pair and symbol i.e
 * $ETHBTC - ETH BTC
 * $ETHUSD - ETH USD
 */
const extractTradePairAndSymbol = symbol => {
  let tradePair = symbol.substr(-3);
  let tradeSymbol = "";
  if (tradePair === symbol) {
    tradeSymbol = symbol;
  } else {
    tradeSymbol = symbol.substr(0, symbol.length - tradePair.length);
  }
  // ETHETH or BTCBTC is an invalid trade pair
  if (tradePair !== tradeSymbol) {
    if (tradePair === "BTC") tradePair = "BTC";
    else if (tradePair === "ETH") {
      tradePair = "ETH";
    } else if (tradePair === "BNB") {
      tradePair = "BNB";
    } else if (tradePair === "USD") {
      // we use BTC if explicitly someone wants i.e VENUSD
      tradePair = "BTC";
    }
    return {
      tradeSymbol,
      tradePair
    };
  }
  return { tradeSymbol, tradePair: "BTC" };
};

/**
 * We need to get the global average as well as current price from Binance
 * Binance doesn't provide price in USD so we need to get Binance BTC in USD
 * And calculate USD by (TRADING_PAIR_USD_PRICE * TRADING_PAIR_ALTCOIN_PRICE) i.e (ETH_USD * VEN_ETH)
 * Note: We need to make 2 Binance call for everything but the trading pairs. 1 CMC call for global average
 */
const getPriceFromBinance = async symbol => {
  try {
    let binancePrice = {};
    symbol = symbol.toUpperCase();
    // Binance requires a trading pair to pull in price i.e VENETH
    let { tradeSymbol, tradePair } = extractTradePairAndSymbol(symbol);
    if (tradeSymbol === "BTC") {
      // we need to make only one call if it's BTC
      binancePrice = await exchanges.binance.getCoinStats(tradeSymbol + "USDT");
      binancePrice["tradePair"] = "USDT";
    } else {
      // 1 call to get symbol price in provided pair
      let bnbSymbolPrice = await exchanges.binance.getCoinStats(
        tradeSymbol + tradePair
      );
      // if and only if the coin exist on binance
      if (bnbSymbolPrice) {
        // 1 call to get current tradePair price to get accurate USD value
        let bnbTradePair = await exchanges.binance.getCoinStats(
          tradePair + "USDT"
        );

        // insert tradePairPrice (USD)
        bnbSymbolPrice["tradePairPrice"] = bnbTradePair["lastPrice"];
        bnbSymbolPrice["tradePair"] = tradePair;
        binancePrice = bnbSymbolPrice;
      } else {
        // sometimes a coin/pair might not exist on binance in that case don't continue;
        return null;
      }
    }
    // insert symbols and pairs for URL since binance doesn't provide this
    binancePrice["symbol"] = tradeSymbol;
    // get beautified objects for discord and return
    return getBinanceEmbeddedContent(binancePrice);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Gets price from Coin Market Cap
 */
const getPriceFromCoinMarketCap = async symbol => {
  // get price from coin market cap and return as object
  symbol = symbol.toUpperCase();
  let { tradeSymbol, tradePair } = extractTradePairAndSymbol(symbol);
  console.log(tradeSymbol);
  console.log(tradePair);
  try {
    return getCoinmarketcapEmbeddedContent(
      await exchanges.coinmarketcap.getCoinStats(tradeSymbol)
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};
const priceInUSD = (pairPrice, ownPrice) => (pairPrice * ownPrice).toFixed(4);
/**
 *
 * Generates embeded object from CMC data for Discord
 */
const getCoinmarketcapEmbeddedContent = cmc => {
  const result = {
    title: `__${cmc.name} (**${cmc.symbol}**)__  (${cmc.rank} Rank)`,
    url: `https://coinmarketcap.com/currencies/${cmc.name}/`,
    description: `Global Average Price: **$${cmc.price_usd}** USD | **${
      cmc.price_btc
    }** BTC`,
    color: parseFloat(cmc.percent_change_24h) < 0 ? 10958133 : 5943124,
    fields: [
      {
        name: "Price Change",
        value: `**${cmc.percent_change_1h}**% 1h | **${
          cmc.percent_change_24h
        }**% 24h`,
        inline: true
      },
      {
        name: "Market Cap",
        value: `$${parseFloat(cmc.market_cap_usd).toFixed(2)}`,
        inline: true
      },
      {
        name: "Volume (24h)",
        value: `$${parseFloat(cmc["24h_volume_usd"]).toFixed(2)}`,
        inline: true
      }
    ]
  };
  return result;
};
/**
 *
 * Generates embeded object from Binance data for Discord
 */
const getBinanceEmbeddedContent = binance => {
  // Sometimes there's no binance result so we won't create that field
  let binanceField = {};
  let description = "";
  let priceChange = "";
  let movement = "";
  let volume = "";
  if (binance) {
    if (binance.tradePairPrice) {
      description = `**$${priceInUSD(
        binance.tradePairPrice,
        binance.lastPrice
      )}** USD | **${parseFloat(binance.lastPrice).toFixed(6)}** ${
        binance.tradePair
      }`;
      priceChange = `**$${priceInUSD(
        binance.tradePairPrice,
        binance.priceChange
      )}** USD | **${parseFloat(binance.priceChange).toFixed(6)}** ${
        binance.tradePair
      } | **${binance.priceChangePercent}**%`;

      movement = `**High**: $${priceInUSD(
        binance.tradePairPrice,
        binance.highPrice
      )} USD / ${parseFloat(binance.highPrice).toFixed(6)} ${
        binance.tradePair
      } | **Low**: $${priceInUSD(
        binance.tradePairPrice,
        binance.lowPrice
      )} USD / ${parseFloat(binance.lowPrice).toFixed(6)} ${binance.tradePair}`;

      volume = `${binance.quoteVolume} ${binance.tradePair}`;
    } else {
      description = `**$${parseFloat(binance.lastPrice).toFixed(4)}** USD`;
      priceChange = `$**${parseFloat(binance.priceChange).toFixed(
        4
      )}** USD | **${binance.priceChangePercent}**%`;
      movement = `**High**: $${parseFloat(binance.highPrice).toFixed(
        4
      )} USD | **Low**: $${parseFloat(binance.lowPrice).toFixed(4)} USD`;
      volume = `$${binance.quoteVolume} USD`;
    }
    binanceField = {
      title: `__**${binance.symbol} on Binance**__`,
      url: `https://www.binance.com/trade.html?symbol=${binance.symbol}_${
        binance.tradePair
      }`,
      description: description,
      color: parseFloat(binance.priceChangePercent) < 0 ? 10958133 : 5943124,
      fields: [
        {
          name: "Price Change (24h)",
          value: priceChange
        },
        {
          name: "Movement (24h)",
          value: movement
        },
        {
          name: "Volume (24h)",
          value: volume
        }
      ]
    };
    return binanceField;
  }
};
module.exports = {
  getPriceFromCoinMarketCap,
  getPriceFromBinance
};
