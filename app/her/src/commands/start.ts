import { Session } from './_type';
import getSession from './_lib/session/get';
import createSession from './_lib/session/create';

const start = async (ctx: any) => {
  const username = ctx.update.message.from.username;
  const session: Session = await getSession(username);
  if (session) {
    return ctx.reply('You already started.');
  } else {
    // create the session in supabase
    const rs = await createSession(username, {
      telegram_handle: username,
      group_id: ctx.update.message.chat.id,
    });
    console.log('...creating session');
    if (rs) {
      return ctx.reply(
        'Session created successfully. There are several things you can do ...'
      );
    } else {
      return ctx.reply('Error creating session. Try again.');
    }
  }
};

export default start;
