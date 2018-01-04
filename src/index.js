/**
 * index.js
 *
 * Application entry point.
 */

const cc = require('cryptocompare')
const Discord = require('discord.js')
const client = new Discord.Client()
global.fetch = require('node-fetch')

const config = require('./config')

// indicate bot is connected
client.on('ready', () => {
  console.info('bot is ready!')
})

// parse user messages and respond accordingly
client.on('message', async message => {
  try {
    const content = message.content
    const tickerRegex = /^[$][A-Z]{3,4}$/gi
    const fuckRegex = /^f+u+c+k+$/gi
    const tradeRegex = /^t+r+a+d+e/gi

    if (content.match(fuckRegex)) {
      message.reply('fuck me daddy')
    } else if (content.match(tickerRegex)) {
      const response = await getMarketValue(content.replace('$', ''))

      const reply = response
        ? `**${content.toUpperCase()}**: $${response}`
        : `**${content.toUpperCase()}** was not found!`
      message.reply(reply)
    } else if(content.match(tradeRegex)) {
      const response = await tradeSimulator(content)
			message.reply(response)
    }
  } catch (error) {
    console.error(error)
  }
})

/**
 * Gets the current market value for any currency.
 * @method getMarketValue
 * @param  {String} ticker - The cryptocurrency symbol i.e $ETH.
 * @return {Number} - The price of the ticker in USD.
 */
async function getMarketValue (ticker) {
  try {
    // fetch crypto pricings
    const VAL = await cc.price(ticker.toUpperCase(), ['USD'])
    return VAL.USD
  } catch (error) {
    console.error(error)
  }
}

/**
 * Run simple trade simulator for bot
 * @method tradeSimulator
 * @param {String} content - content of message to be parsed
 * @return {String} - A response from trade simulator 
 */
async function tradeSimulator (content) {
  var portfolio = require("./portfolio.json")
	var response = ""
	var help_string = "Trade Simulator Usage"
				+ "\ntrade [action] [ticker] [amount] | balance | help"
				+ "\n\taction - BUY or SELL"
				+ "\n\tticker - currency symbol, e.g. $BTC"
				+ "\n\tamount - amount in USD"
  command = content.split(" ")
  try {
    if (command[1].toUpperCase() == "BALANCE") {
		  response += await printBalance(portfolio)
		} else if (command[1].toUpperCase() == "BUY") {
			val_per_unit = await cc.price(command[2].toUpperCase(), ['USD'])
			remaining_balance = portfolio["usd"]["total_units"]
			amount = parseFloat(command[3])

			if(remaining_balance >= amount) {
			  response += "Buy successful\n"
				portfolio["usd"]["total_units"] -= amount
				portfolio[command[2].toLowerCase()] = {"total_units": (portfolio[command[2].toLowerCase()] ? portfolio[command[2].toLowerCase()]["total_units"] : 0)}
				portfolio[command[2].toLowerCase()]["total_units"] += amount / parseFloat(val_per_unit.USD)
				response += await printBalance(portfolio)
		  } else {
				response += "Insufficient funds :("
			}

		} else if (command[1].toUpperCase() == "SELL") {
			val_per_unit = await cc.price(command[2].toUpperCase(), ['USD'])
			units_owned = parseFloat(portfolio[command[2].toLowerCase()]["total_units"])
			total_value = units_owned * val_per_unit.USD
			amount = parseFloat(command[3])
			if (amount > total_value) {
				response += "Selling all " + command[2] + "Total Value: " + total_value + "\n"
				delete portfolio[command[2].toLowerCase()]
				portfolio["usd"]["total_units"] += total_value
			} else {
			  response += "Selling $" + amount +" of " + command[2] + "\n"
				portfolio[command[2].toLowerCase()]["total_units"] = (total_value - amount) / val_per_unit.USD
				portfolio["usd"]["total_units"] += amount
			}
			response += await printBalance(portfolio)
		} else {
		  response += help_string
		}
  } catch (error) {
    console.error(error)
		response += help_string
  }
	writePortfolioToFile(portfolio)
	return response
}

async function printBalance (portfolio) {
		  balance = 0
			response = ""
			response += "Current Portfolio:\nCurrency|Val|Units|Val Per Unit\n"
			for (var currency in portfolio) {
				val_per_unit = await cc.price(currency.toUpperCase(), ['USD'])
				total_units = portfolio[currency]["total_units"]
				total_value = val_per_unit.USD * total_units
				balance += total_value

				response += currency.toUpperCase() + "|$" + Math.round(total_value,2) + "|" + Math.round(total_units,4) + "|$" + val_per_unit.USD + "\n"
			}
			response += ("Total Balance: $" + Math.round(balance,2) + "\n")

			return response
}

function writePortfolioToFile (portfolio) {
	const fs = require('fs')
	portfolioContent = JSON.stringify(portfolio)
	fs.writeFile("./src/portfolio.json", portfolioContent, 'utf8', function (err) {
		if(err) {
			console.log("An error occured while writing JSON Object to File.");
		}
	})
}

// make the bot login to the server
try {
  client.login(config.secret)
  console.info('bot has logged in')
} catch (error) {
  console.error('bot failed to login', error)
}
