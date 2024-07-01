import { getProgram } from '../init';
import * as anchor from '@coral-xyz/anchor';
import { UpdateCommunityProps } from '../_props';

const update = async ({
  admin,
  tokenSymbol,
  decayDays,
  community,
}: UpdateCommunityProps) => {
  let program = getProgram();
  const accounts = {
    communityAccount: community,
    admin,
  };
  const SECONDS_PER_DAY = 86400;
  const txn = await program.methods
    .update(tokenSymbol, new anchor.BN(decayDays * SECONDS_PER_DAY))
    .accounts(accounts)
    .transaction();
  return {
    transaction: txn,
    data: {
      communityAccount: community,
    },
  };
};

export default update;
