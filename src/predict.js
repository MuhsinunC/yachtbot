/**
 * predict.js
 *
 * predict
 */

function getPredict (price) {
  price = parseFloat(price)
  let divisionInt = getRandomInt(4, 9)
  var priceVariance = price / divisionInt // range 9 to 5 to 9
  return roundToXDigits(price + Math.floor(Math.random() * priceVariance) - (priceVariance / 2))
}

function roundToXDigits (value, digits) {
  if (!digits) {
    digits = 2
  }
  value = value * Math.pow(10, digits)
  value = Math.round(value)
  value = value / Math.pow(10, digits)
  return value
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports.predict = {
  predict: getPredict
}
