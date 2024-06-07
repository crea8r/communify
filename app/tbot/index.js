const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters');
const web3 = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const express = require('express');
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 9000;
const sessions = {};
// example: https://github.com/phantom/deep-link-demo-app/blob/20f19f2154e98699f0d5a6b28bc4bb3d5acbcefd/App.tsx

const decryptPayload = (data, nonce, sharedSecret) => {
  if (!sharedSecret) throw new Error('missing shared secret');

  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );
  if (!decryptedData) {
    throw new Error('Unable to decrypt data');
  }
  return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
};

const encryptPayload = (payload, sharedSecret) => {
  if (!sharedSecret) throw new Error('missing shared secret');

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedSecret
  );

  return [nonce, encryptedPayload];
};

const baseURI = 'http://165.232.131.34:' + port;
const botName = 'communify_update_bot';
const metaDataURI = baseURI + '/meta';
const connectURI = baseURI + '/connect';
const bot = new Telegraf(process.env.BOT_TOKEN);

const isConnected = (username) => {
  return (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  );
};

bot.start((ctx) => {
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
});
bot.command('disconnect', (ctx) => {
  const username = ctx.update.message.from.username;
  if (isConnected(username)) {
    delete sessions[username];
    return ctx.reply('You have been disconnected!');
  }
  return ctx.reply('You are not connected yet!');
});
bot.command('connect', (ctx) => {
  const username = ctx.update.message.from.username;
  if (isConnected(username)) {
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
});
bot.command('send', (ctx) => {
  console.log('before checking ctx: ', ctx);
  if (isConnected()) {
    console.log('ctx: ', ctx);
    console.log('ctx.update: ', ctx.update);
  } else {
    return ctx.reply('You are not connected yet. Please /connect !');
  }
});
bot.help((ctx) => {
  return ctx.reply(
    'To connect, use /connect, \n to disconnect, use /disconnect \n dm @hieubt88 for further support!'
  );
});

bot.launch();

const app = express();
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
// serve view files
app.set('views', path.join(__dirname, 'views'));
// serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.send('It works!'));
app.get('/meta', (req, res) => {
  res.render('meta');
});
app.get('/connect', (req, res) => {
  console.log(req.query);
  const phantom_encryption_public_key = req.query.phantom_encryption_public_key;
  const nonce = req.query.nonce;
  const data = req.query.data;
  const username = req.query.username;
  const dappKeyPair = sessions[username].kp;
  if (!phantom_encryption_public_key || !nonce || !data || !dappKeyPair) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const sharedSecretDapp = nacl.box.before(
    bs58.decode(phantom_encryption_public_key),
    dappKeyPair.secretKey
  );
  const connectData = decryptPayload(data, nonce, sharedSecretDapp);
  sessions[username].session = connectData.session;
  sessions[username].publicKey = connectData.public_key;
  return res.render('connect', {
    url: 'https://t.me/' + botName + '?start=' + sessions[username].publicKey,
  });
});

const server = app.listen(port, () => {
  console.log('App is running at port ' + port);
});

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
  console.log('SIGINT: all exited gracefully');
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
  console.log('SIGTERM: all exited gracefully');
});
