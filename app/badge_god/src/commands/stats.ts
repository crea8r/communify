import { Telegraf, session } from 'telegraf';
import { getSessions } from '../state/sessions';
import supabase from '../state/supabase';

const stats = async (ctx: any, bot: Telegraf) => {
  const sessions = getSessions();
  const username = ctx.update.message.from.username;
  if (!sessions[username]) {
    return;
  }
  const private_id = sessions[username].private_group_id;
  const group_id = sessions[username].group.id;
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('group_id', group_id);
  if (data) {
    const badges = data[0].badges;
    const badgeIds = Object.keys(badges);
    badgeIds.map((id) => {
      const badge = badges[id];
      ctx.replyWithPhoto(badge.icon, {
        caption: `Badge ID: ${id}\nBadge Name: ${badge.name}`,
      });
    });
  } else {
    ctx.reply('No badges found');
  }
};

export default stats;
