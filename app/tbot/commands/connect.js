const { getSessions } = require('../state/sessions');
const bs58 = require('bs58');
const { Markup } = require('telegraf');
const nacl = require('tweetnacl');

const connect = (ctx) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    return ctx.reply(
      'You are already connected, your address is ' +
        sessions[username].publicKey +
        ', use /help for full instruction!'
    );
  } else {
    const kp = nacl.box.keyPair();
    sessions[username] = { kp };
    return ctx.reply(
      'Click the button below to open Phantom Wallet:',
      Markup.inlineKeyboard([
        Markup.button.url(
          'Open Phantom Wallet',
          'https://phantom.app/ul/v1/connect?app_url=' +
            metaDataURI +
            '&dapp_encryption_public_key=' +
            bs58.encode(kp.publicKey) +
            '&cluster=devnet' +
            '&redirect_link=' +
            encodeURI(connectURI + '?username=' + username)
        ),
      ])
    );
  }
};

module.exports = connect;
