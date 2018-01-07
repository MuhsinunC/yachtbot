/**
 * Run simple trade simulator for bot
 * @method tradeSimulator
 * @param {String} content - content of message to be parsed
 * @return {String} - A response from trade simulator
 *
 */
const cc = require('cryptocompare')

const tradeSimulator = async function (content) {
  const portfolio = require('./portfolio.json')
  let response = ''
  let helpString =
    'Trade Simulator Usage' +
    '\ntrade [action] [ticker] [amount] | balance | help' +
    '\n\taction - BUY or SELL' +
    '\n\tticker - currency symbol, e.g. $BTC' +
    '\n\tamount - amount in USD'
  let command = content.split(' ')
  try {
    if (command[1].toUpperCase() === 'BALANCE') {
      response += await printBalance(portfolio)
    } else if (command[1].toUpperCase() === 'BUY') {
      let valPerUnit = await cc.price(command[2].toUpperCase(), ['USD'])
      let remainingBalance = portfolio['usd']['totalUnits']
      let amount = parseFloat(command[3])

      if (remainingBalance >= amount) {
        response += 'Buy successful\n'
        portfolio['usd']['totalUnits'] -= amount
        portfolio[command[2].toLowerCase()] = {
          totalUnits: portfolio[command[2].toLowerCase()]
            ? portfolio[command[2].toLowerCase()]['totalUnits']
            : 0
        }
        portfolio[command[2].toLowerCase()]['totalUnits'] +=
          amount / parseFloat(valPerUnit.USD)
        response += await printBalance(portfolio)
      } else {
        response += 'Insufficient funds :('
      }
    } else if (command[1].toUpperCase() === 'SELL') {
      let valPerUnit = await cc.price(command[2].toUpperCase(), ['USD'])
      let unitsOwned = parseFloat(
        portfolio[command[2].toLowerCase()]['totalUnits']
      )
      let totalValue = unitsOwned * valPerUnit.USD
      let amount = parseFloat(command[3])
      if (amount > totalValue) {
        response +=
          'Selling all ' + command[2] + 'Total Value: ' + totalValue + '\n'
        delete portfolio[command[2].toLowerCase()]
        portfolio['usd']['totalUnits'] += totalValue
      } else {
        response += 'Selling $' + amount + ' of ' + command[2] + '\n'
        portfolio[command[2].toLowerCase()]['totalUnits'] =
          (totalValue - amount) / valPerUnit.USD
        portfolio['usd']['totalUnits'] += amount
      }
      response += await printBalance(portfolio)
    } else {
      response += helpString
    }
  } catch (error) {
    console.error(error)
    response += helpString
  }
  writePortfolioToFile(portfolio)
  return response
}

async function printBalance (portfolio) {
  let balance = 0
  let response = ''
  response += 'Current Portfolio:\nCurrency|Val|Units|Val Per Unit\n'
  for (let currency in portfolio) {
    let valPerUnit = await cc.price(currency.toUpperCase(), ['USD'])
    let totalUnits = portfolio[currency]['totalUnits']
    let totalValue = valPerUnit.USD * totalUnits
    balance += totalValue

    response +=
      currency.toUpperCase() +
      '|$' +
      Math.round(totalValue, 2) +
      '|' +
      Math.round(totalUnits, 4) +
      '|$' +
      valPerUnit.USD +
      '\n'
  }
  response += 'Total Balance: $' + Math.round(balance, 2) + '\n'

  return response
}

function writePortfolioToFile (portfolio) {
  const fs = require('fs')
  let portfolioContent = JSON.stringify(portfolio)
  fs.writeFile('./src/portfolio.json', portfolioContent, 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
    }
  })
}

module.exports.tradeSimulator = tradeSimulator
