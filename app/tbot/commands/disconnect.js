const { getSessions, deleteSession } = require('../state/sessions');
const disconnect = (ctx) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    deleteSession(username);
    return ctx.reply('You have been disconnected!');
  }
  return ctx.reply('You are not connected yet!');
};

module.exports = disconnect;
