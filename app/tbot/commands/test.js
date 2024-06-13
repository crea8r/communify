const createTransferTxn = require('../services/createTransferTxn');
const { Markup } = require('telegraf');
const { getSessions } = require('../state/sessions');
const { encryptPayload } = require('../utils');
const bs58 = require('bs58');
const constants = require('../constants');

const processText = (message) => {
  const tokens = message.split(' ');
  const result = {
    user: tokens[0].substring(1, tokens[0].length),
    amount: tokens[1],
    message: tokens.slice(2, tokens.length).join(' '),
  };
  return result;
};
const buildUrl = (path, params) =>
  `https://phantom.app/ul/v1/${path}?${params.toString()}`;

const test = async (ctx) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  // const publicKey = 'CCoSKkgPWC1CSBki4LM9cCp9hM9zURQyfgY6h3UtNitR';
  // const chatId = '-1002002393144';
  // const message = '@HeyCap 1 thank you for amazing pitch deck comment';
  if (
    !sessions[username] ||
    !sessions[username].publicKey ||
    !sessions[username].session
  ) {
    const session = sessions[username].session;
    const sharedSecret = sessions[username].sharedSecret;
    const userPublicKey = sessions[username].publicKey;

    const chatId = ctx.update.message.chat.id;

    const intent = processText(ctx.payload);
    const txn = await createTransferTxn({
      senderAddress: userPublicKey,
      communityChatId: chatId,
      receiverUsername: intent.user,
      amount: intent.amount,
      note: intent.message,
    });
    const serializedTransaction = txn.serialize({
      requireAllSignatures: false,
    });
    const payload = {
      session,
      transaction: bs58.encode(serializedTransaction),
    };
    const [nonce, encryptedPayload] = encryptPayload(payload, sharedSecret);
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      nonce: bs58.encode(nonce),
      // TODO: redirect to a /handler where we trigger a success message
      redirect_link: encodeURI('http://t.me/' + constants.botName),
      payload: bs58.encode(encryptedPayload),
    });
    const url = buildUrl('signAndSendTransaction', params);
    return ctx.reply(
      'Click the button below to open Phantom Wallet and approve the tip: ',
      Markup.inlineKeyboard([Markup.button.url('Approve the tip', url)])
    );
  }
};

module.exports = test;
