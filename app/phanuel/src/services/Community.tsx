import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../funcs/config';
import sendTxn from '../funcs/sendTxn';
import * as anchor from '@coral-xyz/anchor';

export type CreateCommunityProps = {
  admin: anchor.Wallet;
  tokenSymbol: string;
  decayTime: number;
  success: any;
  error?: any;
  fin: any;
};

export const create = async ({
  admin,
  tokenSymbol,
  decayTime,
  success,
  error,
  fin,
}: CreateCommunityProps) => {
  let program = getProgram();
  const accounts = {
    admin: admin.publicKey,
    communityAccount: anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), admin.publicKey.toBuffer()],
      program.programId
    )[0],
  };
  const txn = await program.methods
    .create(tokenSymbol, new anchor.BN(decayTime))
    .accounts(accounts)
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      console.log('trigger success callback ', data);
      success();
    })
    .catch((e) => {
      alert('Error creating token: ' + e.message);
      if (error) error();
    })
    .finally(() => {
      if (fin) fin();
    });
};

export const update = async ({
  admin,
  tokenSymbol,
  decayTime,
  success,
  error,
  fin,
}: CreateCommunityProps) => {
  let program = getProgram();
  const accounts = {
    communityAccount: anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), admin.publicKey.toBuffer()],
      program.programId
    )[0],
    admin: admin.publicKey,
  };
  const txn = await program.methods
    .update(tokenSymbol, new anchor.BN(decayTime))
    .accounts(accounts)
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      console.log('trigger success callback ', data);
      success();
    })
    .catch((e) => {
      alert('Error creating token: ' + e.message);
      if (error) error();
    })
    .finally(() => {
      if (fin) fin();
    });
};

export const mintTo = async ({
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

export default {
  create,
  mintTo,
};
