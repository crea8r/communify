import { Telegraf } from 'telegraf';
require('dotenv').config();

import commandTest from './commands/test';
import commandStat from './commands/stat';
/** admin */
import commandStart from './commands/start';
import commandRegister from './commands/admin/register';
import commandMintTo from './commands/admin/mint';
/** member */

console.log('token: ', process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN as string);
bot.command('start', (ctx) => commandStart(ctx));
bot.command('test', (ctx) => commandTest(ctx, bot));
bot.command('stat', (ctx) => commandStat(ctx, bot));
bot.command('register', (ctx) => commandRegister(ctx, bot));
bot.command('mint', (ctx) => commandMintTo(ctx, bot));
bot.reaction('👍', (ctx) => {
  console.log(ctx.update.message_reaction);
  ctx.reply('👍');
});
console.log('bot started');
bot.launch({ allowedUpdates: ['message', 'message_reaction'] });
