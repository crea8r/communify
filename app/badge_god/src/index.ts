import { Telegraf } from 'telegraf';
require('dotenv').config();

/** admin commands */
import startCommnand from './commands/start';
import registerCommand from './commands/register';
import statsCommand from './commands/stats';
// create or override a new badge; chat in the private chat
import create from './commands/create';
// delete the badge; cannot delete if someone has it; chat in the private chat
import del from './commands/del';
// grant a badge to a community member; chat in the group chat
import grant from './commands/grant';
/** user commands */
// show all badges of an user; chat in the group
import badge from './commands/badge';
// show all badges of a group; chat in the group
import all_badge from './commands/all_badge';

const bot = new Telegraf(process.env.BOT_TOKEN as string);
bot.start(startCommnand);
bot.command('register', (ctx) => registerCommand(ctx, bot));
bot.command('stats', (ctx) => statsCommand(ctx, bot));
bot.command('create', (ctx) => create(ctx, bot));
bot.command('grant', (ctx) => grant(ctx, bot));

bot.launch();
