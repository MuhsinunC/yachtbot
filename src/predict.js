/**
 * fuck.js
 *
 * fuck
 */

function getPredict(price){
  price = parseFloat(price);
  var priceVariance = price / 9;
  return roundToXDigits(price +  Math.floor(Math.random() * priceVariance) - (priceVariance / 2));
}

function roundToXDigits(value, digits) {
    if(!digits){
        digits = 2;
    }
    value = value * Math.pow(10, digits);
    value = Math.round(value);
    value = value / Math.pow(10, digits);
    return value;
}

module.exports.predict = {
  predict: getPredict
}
