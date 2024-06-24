import { Telegraf } from 'telegraf';
import createMnemonic from '../_lib/createMnemonic';
import getSession from '../_lib/session/get';
import isAdmin from '../_lib/isAdmin';
import getCommunity from '../../services/getCommunity';
import { Session } from '../_type';
import createCommunity from '../../services/createCommunity';
import * as anchor from '@coral-xyz/anchor';

const extractPayload = (payload: string) => {
  const tokens = payload.split(' ');
  const symbol = tokens[0];
  const expire = tokens[1];
  if (!symbol || !expire || !parseInt(expire)) {
    return null;
  }
  return { symbol, expire: parseInt(expire) };
};

// perform in the group chat
const register = async (ctx: any, bot: Telegraf) => {
  const username = ctx.update.message.from.username;
  const extractedPayload = extractPayload(ctx.payload);
  if (!extractedPayload) {
    return ctx.reply(
      'Invalid payload. Please use /register [symbol] [expired_in_X_days]',
      {
        reply_to_message_id: ctx.update.message.message_id,
      }
    );
  }
  // check if username has a mnemonic in database, create one if not
  const mnemonic = await createMnemonic(username);
  // check if he already /start, if not, ask him to /start (to get the private chat group_id)
  const session: Session = await getSession(username);
  if (!session) {
    return ctx.reply('Please go to the private chat with me and start first.');
  }
  const { result: _isAdmin, message } = await isAdmin(ctx, bot);
  // check if he is already an admin, if so, return
  if (!_isAdmin) {
    return ctx.reply(message, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  }
  // check if this community is already registered, if so, return
  const community = await getCommunity(session.chat_id);
  if (community) {
    return ctx.reply('This community is already registered.');
  } else {
    const { data, error } = await createCommunity(
      mnemonic,
      extractedPayload.symbol,
      extractedPayload.expire
    );
    if (!data) {
      return ctx.reply(error);
    }
    return ctx.reply(
      'Community registered successfully. Community detail is [here](' +
        process.env.SOLANA_EXPLORER_URL +
        '/address/' +
        (data.publicKey as anchor.web3.PublicKey).toBase58() +
        '?cluster=' +
        process.env.SOLANA_CLUSTER +
        ')',
      {
        parse_mode: 'Markdown',
      }
    );
  }
};

export default register;
