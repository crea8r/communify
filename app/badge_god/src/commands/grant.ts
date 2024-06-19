import { Telegraf } from 'telegraf';
import { getSessions } from '../state/sessions';
import supabase from '../state/supabase';
import badge from './badge';
const grant = async (ctx: any, bot: Telegraf) => {
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
  const tokens = payload.split(' '); // /grant [username] [badge_id]
  const receiver = tokens[1];
  const badge_id = tokens[2];
  if (!badge_id || !receiver) {
    return ctx.reply(
      'Invalid input. Please try again. The format is /grant [username] [badge_id]'
    );
  }
  const { data: dataGroup, error: errorGroup } = await supabase
    .from('badges')
    .select('*')
    .eq('group_id', group_id);
  if (!dataGroup || dataGroup.length === 0) {
    return ctx.reply('No badges found');
  } else {
    const badges = dataGroup[0].badges;
    if (!badges[badge_id]) {
      return ctx.reply(`${badge_id} is not a valid badge id.`);
    }
    const { data, error } = await supabase
      .from('mebers_badges')
      .select('*')
      .eq('group_id', group_id)
      .eq('member_id', receiver);
    let membersBadges: any = undefined;
    let response;
    if (data && data.length > 0) {
      // no badge with this id
      membersBadges = data[0].badges;
    }
    if (!membersBadges) {
      membersBadges = [badge_id];
    } else {
      console.log('membersBadges', membersBadges);
      if (membersBadges.indexOf(badge_id) === -1) {
        membersBadges.push(badge_id);
      }
    }
    if (data) {
      // update
      response = await supabase
        .from('members_badges')
        .update({
          badges: membersBadges,
        })
        .eq('group_id', group_id)
        .eq('member_id', receiver);
    } else {
      // insert
      response = await supabase.from('members_badges').insert([
        {
          group_id: group_id,
          member_id: receiver,
          badges: membersBadges,
        },
      ]);
    }

    if (!response || response.error) {
      return ctx.reply('Something went wrong. Please try again.');
    } else {
      return ctx.reply(
        `Congrats, ${receiver}, you are granted "${badges[badge_id].name}"`
      );
    }
  }
};
export default grant;
