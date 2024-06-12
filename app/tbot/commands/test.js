const viewBalance = require('../services/viewBalance');

const test = async (ctx) => {
  const publicKey = 'CCoSKkgPWC1CSBki4LM9cCp9hM9zURQyfgY6h3UtNitR';
  const chatId = '-1002002393144';
  return ctx.reply(await viewBalance(publicKey, chatId));
};

module.exports = test;
