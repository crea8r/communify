import { Telegraf } from 'telegraf';
import isAdmin from './lib/isAdmin';
const test = async (ctx: any, bot: Telegraf) => {
  console.log(ctx.update);
  const chat = ctx.update.message.chat;
  const groupId = chat.id;
  const from = ctx.update.message.from;
  // console.log(ctx.payload);
  // if (ctx.payload == '@HeyCap') {
  //   ctx.reply('Badges: Front End, Novice');
  // }
  const { result, message } = await isAdmin(ctx, bot);
  if (!result) {
    return ctx.reply(message, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  }
  return ctx.reply('Hello admin', {
    reply_to_message_id: ctx.update.message.message_id,
  });
};
export default test;
