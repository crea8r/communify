// register you as admin of a community
import { Telegraf } from 'telegraf';
import { getSessions } from '../state/sessions';
import isAdmin from './lib/isAdmin';
const register = async (ctx: any, bot: Telegraf) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  if (!sessions[username]) {
    return ctx.reply('Please go to the private chat with me and start first.');
  }
  const { result, message } = await isAdmin(ctx, bot);
  const group_id = ctx.update.message.chat.id;
  const title = ctx.update.message.chat.title;
  const private_id = sessions[username].private_group_id;
  if (result) {
    sessions[username].group = {
      id: group_id,
      title,
    };
    console.log(sessions);
    bot.telegram.sendMessage(
      private_id,
      `Congratulation! you are now registered as admin of group ${title}.\n
✅ If you ever want to manage other groups, go to that group and type /register again.\n
✅ You can start managing badges now.\n
✅ Type /stats to see the current community info and its badges.\n
✅ Type /create [badge_id] [badge_name] [icon_link] to create a new badge.
✅ Type /delete [badge_id] to delete a badge.\n
✅ Type /grant [badge_id] [username] to assign a badge to a user.\n
      `
    );
    return;
  }
  bot.telegram.sendMessage(
    private_id,
    message || 'Something went wrong. Please try again.'
  );
};

export default register;
