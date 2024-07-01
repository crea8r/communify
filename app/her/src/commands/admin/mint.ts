import { Telegraf } from 'telegraf';
import getMnemonic from '../_lib/getMnemonic';
import isAdmin from '../_lib/isAdmin';
import getCommunity from '../../services/getCommunity';
import mintTo from '../../services/mintTo';
import * as anchor from '@coral-xyz/anchor';
import * as bip39 from 'bip39';

const extractPayload = (payload: string) => {
  const tokens = payload.split(' ');
  const receiverUsername = tokens[0].replace('@', '');
  const amount = parseFloat(tokens[1]);
  // console.log('receiverUsername', receiverUsername);
  // console.log('amount', amount);
  if (!receiverUsername || !amount) {
    return null;
  }
  return { receiverUsername, amount };
};

// mint points for a member of the group
const mint = async (ctx: any, bot: Telegraf) => {
  const payload = ctx.payload;
  const extractedPayload = extractPayload(payload);
  const adminUsername = ctx.update.message.from.username;
  const group_id = ctx.update.message.chat.id;
  if (!extractedPayload) {
    return ctx.reply('Invalid payload. Please use /mint @username amount', {
      reply_to_message_id: ctx.update.message.message_id,
    });
  }
  const { result: isAdminResult, message } = await isAdmin(ctx, bot);
  if (!isAdminResult) {
    return ctx.reply(message, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  }
  const community = await getCommunity(group_id);
  if (!community) {
    return ctx.reply('This community is not registered yet.');
  }
  const { receiverUsername, amount } = extractedPayload;
  const adminMnemonic = await getMnemonic(adminUsername);
  const receiverMnemonic = await getMnemonic(receiverUsername);
  const receiver = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(receiverMnemonic).slice(0, 32)
  );
  const rs = await mintTo({
    adminMnemonic,
    communityAccount: community.publicKey,
    receiver: receiver.publicKey,
    amount,
  });
  if (rs) {
    return ctx.reply(
      'Congrats @' + receiverUsername + ', you got ' + amount + ' points !'
    );
  } else {
    return ctx.reply(
      'Hey, @' + receiverUsername + ', something went wrong, mint failed.'
    );
  }
};

export default mint;
