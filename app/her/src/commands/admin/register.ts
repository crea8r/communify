import { Telegraf } from 'telegraf';
import getMnemonic from '../_lib/getMnemonic';
import getSession from '../_lib/session/get';
import isAdmin from '../_lib/isAdmin';
import getCommunity from '../../services/getCommunity';
import { Session } from '../_type';
import createCommunity from '../../services/createCommunity';
import * as anchor from '@coral-xyz/anchor';
import upsertCommunityTelegram from '../../services/upsertCommunityTelegram';

const extractPayload = (payload: string) => {
  const tokens = payload.split(' ');
  const symbol = tokens[0];
  const expire = tokens[1];
  const override = tokens[2];
  if (!symbol || !expire || !parseInt(expire)) {
    return null;
  }
  return {
    symbol,
    expire: parseInt(expire),
    override: override === 'override',
  };
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
  const mnemonic = await getMnemonic(username);
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
  const chat_id = ctx.update.message.chat.id;
  const community = await getCommunity(chat_id);
  const decay_after_days = community.decay_after / (24 * 60 * 60);
  if (community) {
    if (extractedPayload.override) {
    } else {
      return ctx.reply(
        'This community is already registered. Point name is ' +
          community.symbol +
          ', expire period is ' +
          decay_after_days +
          ' days.'
      );
    }
  } else {
    const { data, error } = await createCommunity(
      mnemonic,
      extractedPayload.symbol,
      extractedPayload.expire * 24 * 60 * 60
    );
    if (!data) {
      return ctx.reply(error);
    } else {
      const communityAccount = data.publicKey as anchor.web3.PublicKey;
      const upsertSucceed = await upsertCommunityTelegram({
        adminUserName: username,
        adminMnemonic: mnemonic,
        chatId: chat_id,
        communityAccount,
      });
      if (upsertSucceed) {
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
      } else {
        return ctx.reply('Error registering community. Try again.');
      }
    }
  }
};

export default register;
