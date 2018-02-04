/**
 * replies.js
 *
 * replies
 */

function getHelp () {
  return 'Commands:' +
         '\n- $[ticker]: Lists information about given ticker' +
         '\n- trade: Shows help for Trade Simulator' +
         '\n- recommend: Recommends you a coin' +
         '\n- recommend all: Recommends you a coin... but has to do something with "all"... lol' +
         "\n- predict $[ticker]: Makes an inference to what the given ticker is going to be priced at (jk it's just a random number lol)"
}

function getFuck () {
  return 'fuck me daddy :tongue:'
}

function getBitch () {
  return "don't be a bitch."
}

function getShit () {
  return 'lol u lost money. :money_with_wings:'
}

function getAsshole () {
  return "***YOU'RE*** the asshole. :reversed_hand_with_middle_finger_extended:"
}

function getFuckYou () {
  return 'no, fuck you :reversed_hand_with_middle_finger_extended:'
}

module.exports.cmds = {
  help: getHelp,
  fuck: getFuck,
  bitch: getBitch,
  shit: getShit,
  asshole: getAsshole,
  fuckyou: getFuckYou
}
