import { PublicKey } from '@solana/web3.js';
import listAllBagAccounts from './listAllBagAccounts';
import { getProgram } from '../init';
import * as anchor from '@coral-xyz/anchor';
import { CLOCK_LAYOUT } from '../_schemas';
const balance = async ({
  member,
  community,
}: {
  member: PublicKey;
  community: PublicKey;
}) => {
  const bags = await listAllBagAccounts({ member, community });
  const program = getProgram();
  let balance = 0;
  const clockInfo = await program.provider.connection.getAccountInfo(
    anchor.web3.SYSVAR_CLOCK_PUBKEY
  );
  let currentUnixTimestamp = new Date().getTime() / 1000;
  if (clockInfo) {
    const clockData = CLOCK_LAYOUT.decode(clockInfo.data);
    currentUnixTimestamp = clockData.unix_timestamp.toNumber();
  }
  bags.forEach((bag) => {
    if (
      bag.amount.toNumber() > 0 &&
      bag.decayAt.toNumber() > currentUnixTimestamp
    ) {
      balance += bag.amount.toNumber();
    }
  });
  return balance;
};
export default balance;
