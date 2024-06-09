const start = (ctx) => {
  console.log('start payload:', ctx.payload);
  if (ctx.payload) {
    try {
      const address = ctx.payload;
      return ctx.reply('Welcome ' + address);
    } catch (e) {}
  }
  const username = ctx.update.message.from.username;
  if (isConnected(username)) {
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
