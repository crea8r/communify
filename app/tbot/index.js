const { Telegraf } = require('telegraf');
const web3 = require('@solana/web3.js');
const express = require('express');
const path = require('path');
const constants = require('./constants');
require('dotenv').config();

// import all telegram commands
const commandHelp = require('./commands/help');
const commandDisconnect = require('./commands/disconnect');
const commandConnect = require('./commands/connect');
const commandStart = require('./commands/start');
const commandTip = require('./commands/tip');
const commandBalance = require('./commands/balance');
// -- admin command
const commandRegister = require('./commands/register');

// import all expressjs handers
const handlerMeta = require('./handlers/meta');
const handlerConnect = require('./handlers/connect');

// example: https://github.com/phantom/deep-link-demo-app/blob/20f19f2154e98699f0d5a6b28bc4bb3d5acbcefd/App.tsx
const bot = new Telegraf(process.env.BOT_TOKEN);
// setup connection to solana devnet

bot.start(commandStart);
bot.command('disconnect', commandDisconnect);
bot.command('connect', commandConnect);
bot.command('tip', commandTip);
bot.command('balance', commandBalance);
bot.command('register', commandRegister);
bot.help(commandHelp);

// for development & testing
const testCommand = require('./commands/test');
bot.command('test', testCommand);

bot.launch();

const app = express();
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
// serve view files
app.set('views', path.join(__dirname, 'views'));
// serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.send('It works!'));
app.get('/meta', handlerMeta);
app.get('/connect', handlerConnect);
const server = app.listen(constants.port, () => {
  console.log('App is running at port ' + constants.port);
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
