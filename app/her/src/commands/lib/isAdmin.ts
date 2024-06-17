import { Telegraf } from 'telegraf';

const isAdmin = async (ctx: any, bot: Telegraf) => {
  const chat = ctx.update.message.chat;
  const groupId = chat.id;
  const from = ctx.update.message.from;
  if (chat.type === 'group') {
    const admins = await bot.telegram.getChatAdministrators(groupId);
    const found = admins.find((a: any) => a.user.id === from.id);
    if (found) {
      return { result: true };
    } else {
      return { result: false, message: 'You are not an admin' };
    }
  }
  return { result: false, message: 'This is not a group chat' };
};

export default isAdmin;
