const { getSessions } = require('../state/sessions');
const viewBalance = require('../services/viewBalance');

const balance = async (ctx) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    const publicKey = sessions[username].publicKey;
    const chatId = ctx.update.message.chat.id;
    return ctx.reply(
      '@' + username + ' balance is ' + (await viewBalance(publicKey, chatId))
    );
  }
  return ctx.reply('Please /connect first!');
};

module.exports = balance;
