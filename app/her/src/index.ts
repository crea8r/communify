import { Telegraf } from 'telegraf';
require('dotenv').config();

import commandTest from './commands/test';
/** admin */
import commandStart from './commands/admin/start';
import commandRegister from './commands/admin/register';
/** member */
console.log('token: ', process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN as string);
bot.command('start', (ctx) => commandStart(ctx));
bot.command('test', (ctx) => commandTest(ctx, bot));
bot.command('register', (ctx) => commandRegister(ctx, bot));
console.log('bot started');
bot.launch();
