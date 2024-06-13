const { getSessions } = require('../state/sessions');

const start = (ctx) => {
  console.log('start ctx: ', ctx);
  if (ctx.payload) {
    try {
      const message = ctx.payload;
      console.log('payload: ', message);
      return ctx.reply(message);
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
