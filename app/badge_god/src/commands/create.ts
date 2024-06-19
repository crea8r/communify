import { Telegraf } from 'telegraf';
import supabase from '../state/supabase';
import { getSessions } from '../state/sessions';
const create = async (ctx: any, bot: Telegraf) => {
  const sessions = getSessions();
  const username = ctx.message.from.username;
  if (
    !sessions[username] ||
    !sessions[username].private_group_id ||
    !sessions[username].group
  ) {
    ctx.reply('Please go to the private chat with me and start first.');
  }
  const group_id = sessions[username].group.id;
  const payload = ctx.message.text;
  const tokens = payload.split(' ');
  const badge_id = tokens[1];
  const icon_link = tokens[tokens.length - 1];
  const badge_name = tokens.slice(2, tokens.length - 1).join(' ');
  if (
    !badge_id ||
    !icon_link ||
    !badge_name ||
    icon_link.indexOf('http') === -1
  ) {
    return ctx.reply(
      'Invalid input. Please try again. The format is /create [badge_id] [badge_name] [icon_link]'
    );
  }
  // select badges from supabase; the table name is badges; filter using column group_id
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('group_id', group_id);
  let badges: any = {};
  if (data && data.length > 0) {
    // no badge with this id
    badges = data[0].badges;
  }
  badges[badge_id] = {
    name: badge_name,
    icon: icon_link,
  };
  const response = await supabase.from('badges').upsert([
    {
      group_id: sessions[username].group.id,
      badges: badges,
    },
  ]);
  if (response.error) {
    return ctx.reply('Something went wrong. Please try again.');
  } else {
    return ctx.reply('Badge created.');
  }
};
export default create;

// https://i.imgur.com/zevNrUZ.jpeg
// https://i.imgur.com/2DgOzpF.jpeg
// https://i.imgur.com/yn6mJSN.jpeg
