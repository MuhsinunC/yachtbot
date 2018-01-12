/**
 * fuck.js
 *
 * fuck
 */

function getPredict(price){
  price = parseFloat(price);
  var priceVariance = price / 9;
  return price +  Math.floor(Math.random() * priceVariance) - (priceVariance / 2);
}

module.exports.predict = {
  predict: getPredict
}
