import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../init';
import { CreateCommunityProps } from '../_props';

const create = async ({
  admin,
  tokenSymbol,
  decayDays,
  renter,
}: CreateCommunityProps) => {
  let program = getProgram();
  const rand = anchor.web3.Keypair.generate();
  const [communityAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), rand.publicKey.toBuffer()],
    program.programId
  );
  const accounts = {
    admin,
    random: rand.publicKey,
    communityAccount,
    renter,
  };
  const SECONDS_PER_DAY = 86400;
  const txn = await program.methods
    .create(tokenSymbol, new anchor.BN(Math.floor(decayDays * SECONDS_PER_DAY)))
    .accounts(accounts)
    .transaction();
  return { transaction: txn, data: { communityAccount } };
};

export default create;
