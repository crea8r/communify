const { getSessions } = require('../state/sessions');
const viewBalance = require('../services/viewBalance');

const balance = async (ctx) => {
  const sessions = getSessions();
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    const publicKey = sessions[username].publicKey;
    const chatId = ctx.update.message.chat.id;
    ctx.reply(viewBalance(publicKey, chatId));
  }
  return ctx.reply('Please /connect first!');
};

module.exports = balance;
