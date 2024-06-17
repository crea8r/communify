import { Telegraf } from 'telegraf';
require('dotenv').config();

import commandTest from './commands/test';
console.log('token: ', process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN as string);
bot.command('test', (ctx) => commandTest(ctx, bot));
bot.launch();
