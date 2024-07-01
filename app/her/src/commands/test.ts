import { Telegraf } from 'telegraf';
import * as bip39 from 'bip39';
import getCommunity from '../services/getCommunity';
import createCommunity from '../services/createCommunity';
import getRenter from '../services/_renter';
const test = async (ctx: any, bot: Telegraf) => {
  const renter = getRenter('', '');
  console.log('renter: ', renter.publicKey.toBase58());
  const community = await getCommunity('-1002002393144');
  console.log('community: ', community);
  ctx.reply(community);
};
export default test;
