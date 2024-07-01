import { Telegraf } from 'telegraf';
import getCommunity from '../services/getCommunity';

const stat = async (ctx: any, bot: Telegraf) => {
  const group_id = ctx.update.message.chat.id;
  const community = await getCommunity(group_id);
  if (!community) {
    return ctx.reply('This community is not registered yet.');
  }
  return ctx.reply(
    'Point name is ' +
      community.symbol +
      ', expire period is ' +
      community.decay_after / (24 * 60 * 60) +
      ' days.'
  );
};

export default stat;
