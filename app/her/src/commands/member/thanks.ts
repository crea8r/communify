import { Telegraf } from 'telegraf';
import getMnemonic from '../_lib/getMnemonic';

const extractPayload = (payload: string) => {
  const tokens = payload.split(' ');
  // /thanks @hieubt88 some text

  const receiver = tokens[1].replace('@', '');
  const reason = tokens.slice(2).join(' ');

  if (!receiver || !reason) {
    return null;
  }
  return { receiver, reason };
};

const thanks = async (ctx: any, bot: Telegraf) => {
  const payload = ctx.payload;
  const extractedPayload = extractPayload(payload);
  console.log(extractPayload);
  const sender = ctx.update.message.from.username;
  const group_id = ctx.update.message.chat.id;
  if (!extractedPayload) {
    return ctx.reply(
      'Invalid payload. Please use /thanks @username why_you_thank_him/her',
      {
        reply_to_message_id: ctx.update.message.message_id,
      }
    );
  }
  const { receiver, reason } = extractedPayload;
  const amount = parseFloat(process.env.DEFAULT_AMOUNT || '');
  const senderMnemonic = await getMnemonic(sender);
  const receiverMnemonic = await getMnemonic(receiver);
};

export default thanks;
