import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../init';
import { MintToProps } from '../_props';

const mintTo = async ({
  admin,
  receiver,
  amount,
  community,
  renter,
}: MintToProps) => {
  let program = getProgram();
  const [memberInfoAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), community.toBuffer(), receiver.toBuffer()],
    program.programId
  );
  // console.log('-- memberInfoAccount --', memberInfoAccount.toBase58());
  const memberInfo = await program.account.memberInfo.fetch(memberInfoAccount);
  // console.log('-- memberInfo --', memberInfo);
  const [bagAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Bag'),
      memberInfoAccount.toBuffer(),
      memberInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  // console.log('-- bagAccount --', bagAccount.toBase58());
  const accounts = {
    communityAccount: community,
    admin,
    bag: bagAccount,
    memberInfo: memberInfoAccount,
    member: receiver,
    phanuelProgram: program.programId,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    renter,
  };
  const txn = await program.methods
    .mintTo(new anchor.BN(amount))
    .accounts(accounts)
    .transaction();
  return {
    transaction: txn,
    data: {
      memberInfoAccount,
      bagAccount,
    },
  };
};

export default mintTo;
