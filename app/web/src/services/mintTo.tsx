import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../funcs/config';
import sendTxn from '../funcs/sendTxn';
import * as anchor from '@coral-xyz/anchor';

const mintTo = async ({
  admin,
  receiver,
  amount,
  success,
  error,
}: {
  admin: anchor.Wallet;
  receiver: PublicKey;
  amount: number; // int
  success: any;
  error: any;
}) => {
  let program = getProgram();
  const [communityAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), admin.publicKey.toBuffer()],
    program.programId
  );
  const [memberInfoAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), communityAccount.toBuffer(), receiver.toBuffer()],
    program.programId
  );
  console.log('-- memberInfoAccount --', memberInfoAccount.toBase58());
  const memberInfo = await program.account.memberInfo.fetch(memberInfoAccount);
  console.log('-- memberInfo --', memberInfo);
  const [bagAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Bag'),
      memberInfoAccount.toBuffer(),
      memberInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  console.log('-- bagAccount --', bagAccount.toBase58());
  const accounts = {
    communityAccount,
    admin: admin.publicKey,
    bag: bagAccount,
    memberInfo: memberInfoAccount,
    member: receiver,
    phanuelProgram: program.programId,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  const txn = await program.methods
    .mintTo(new anchor.BN(amount))
    .accounts(accounts)
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then(() => {
      success();
    })
    .catch((e: any) => {
      console.log('txn failed! ', receiver.toBase58(), '; e: ', e);
      error(receiver);
    });
};

export default mintTo;
