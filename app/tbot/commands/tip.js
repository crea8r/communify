const { getSessions } = require('../state/sessions');
const bs58 = require('bs58');
const { Markup } = require('telegraf');

const processText = (message) => {
  const tokens = message.split(' ');
  const result = {
    user: tokens[0],
    amount: tokens[1],
    message: tokens.slice(2, tokens.length).join(' '),
  };
  return result;
};

const tip = (ctx) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  const payload = ctx.payload;
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    if (payload.split(' ').length < 3) {
      return ctx.reply(
        'Invalid command, please use /tip <username> <amount> <message>'
      );
    } else {
      const rs = processText(payload);
      const kp = sessions[username].kp;
      return ctx.reply(
        'Click the button below to open Phantom Wallet and approve the tip:',
        Markup.inlineKeyboard([
          Markup.button.url(
            'Approve the tip',
            'https://phantom.app/ul/v1/signAndSendTransaction' +
              '?dapp_encryption_public_key=' +
              bs58.encode(kp.publicKey)
          ),
        ])
      );
    }
  } else {
    return ctx.reply('You are not connected yet. Please /connect !');
  }
};

module.exports = tip;
