const createTransferTxn = require('../services/createTransferTxn');
const { Markup } = require('telegraf');
const { getSessions } = require('../state/sessions');
const { encryptPayload } = require('../utils');
const bs58 = require('bs58');
const constants = require('../constants');

const test = (ctx) => {
  const createWallet = () => {};
  ctx.reply('Hi there!', {
    reply_markup: {
      inline_keyboard: [
        /* Inline buttons. 2 side-by-side */
        [
          {
            text: 'Create a secret',
            callback_data: 'create_secret',
          },
          {
            text: 'Retrive the secret',
            callback_data: 'retrieve_secret',
          },
        ],

        /* One button */
        [{ text: 'Next', callback_data: 'next' }],

        /* Also, we can have URL buttons. */
        [{ text: 'Open in browser', url: 'telegraf.js.org' }],
      ],
    },
  });
};
module.exports = test;
