const { getSessions } = require('../state/sessions');
const base58 = require('bs58');

const start = (ctx) => {
  if (ctx.payload) {
    try {
      const message = ctx.payload;
      return ctx.reply(base58.decode(message));
    } catch (e) {}
  }
  const username = ctx.update.message.from.username;
  const sessions = getSessions();
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    return ctx.reply(
      'Welcome back ' +
        sessions[username].publicKey +
        ', use /help for full instruction!'
    );
  }
  return ctx.reply(
    'Hello, make sure you install Phantom and set your network to `devnet` and /connect to begin!'
  );
};

module.exports = start;
