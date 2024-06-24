import { Telegraf } from 'telegraf';
import * as bip39 from 'bip39';
import getCommunity from '../services/getCommunity';
import createCommunity from '../services/createCommunity';
const test = async (ctx: any, bot: Telegraf) => {
  const mnemonic = bip39.generateMnemonic();
  // const community = await getCommunity('-1002002393144');
  const rs = await createCommunity(mnemonic, 'HER', 365);
  console.log('rs: ', rs);
  ctx.reply(rs);
};
export default test;
