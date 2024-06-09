import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import {
  MAX_ADDRESSES_PER_EXTEND_TXN,
  initializeLookupTable,
  sendV0Transaction,
  waitForNewBlock,
} from '../funcs/v0Helper';
import { MultipleMintProps } from './_types';

export const MAX_PER_INS = parseInt(import.meta.env.VITE_MAX_PER_INS);

const multipleMint = async ({
  admin,
  receivers,
  amount,
  info,
  success,
  error,
}: MultipleMintProps) => {
  let program = getProgram();
  const txns: any[] = [];
  const noOfExtendsTxn = Math.ceil(
    (2 * receivers.length) / MAX_ADDRESSES_PER_EXTEND_TXN
  );
  const noOfMintTxn = Math.ceil(receivers.length / MAX_PER_INS);
  for (var i = 0; i < 1 + noOfExtendsTxn + noOfMintTxn; i++) {
    txns.push({
      txid: '',
      status: 0,
      msg: '',
    });
  }
  info(txns);
  const [communityAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), admin.publicKey.toBuffer()],
    program.programId
  );
  const multipleMintAccounts = {
    communityAccount,
    admin: admin.publicKey,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    phanuelProgram: program.programId,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  const memberInfoAccounts = [];
  const BagAccounts = [];
  for (var i = 0; i < receivers.length; i++) {
    const member = receivers[i];
    const [memberInfoPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('User'), communityAccount.toBuffer(), member.toBuffer()],
      program.programId
    );
    memberInfoAccounts.push({
      pubkey: memberInfoPDA,
      isSigner: false,
      isWritable: true,
    });
    const memberInfo = await program.account.memberInfo.fetch(memberInfoPDA);
    const [bagPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('Bag'),
        memberInfoPDA.toBuffer(),
        new anchor.BN(memberInfo.max).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    BagAccounts.push({ pubkey: bagPDA, isSigner: false, isWritable: true });
  }
  const remainingAccounts = [...memberInfoAccounts, ...BagAccounts];
  const connection = program.provider.connection;
  const lookupTableAddress = await initializeLookupTable(
    admin,
    connection,
    remainingAccounts.map((ac) => ac.pubkey),
    (data: { idx: number; txid: any; msg: any; status: any }) => {
      txns[data.idx].txid = data.txid;
      txns[data.idx].msg = data.msg;
      txns[data.idx].status = data.status;
      console.log('finished: ', data.idx);
      info(txns);
    }
  );
  await waitForNewBlock(connection, 1);
  const lookupTableAccounts = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;
  if (!lookupTableAccounts) {
    error('Lookup table accounts not found');
    return;
  }
  const noOfMembers = receivers.length;
  for (var i = 0; i < Math.ceil(noOfMembers / MAX_PER_INS); i++) {
    const start = i * MAX_PER_INS;
    const end =
      start + MAX_PER_INS > noOfMembers ? noOfMembers : start + MAX_PER_INS;
    const bagSlice = BagAccounts.slice(start, end);
    const memberSlice = memberInfoAccounts.slice(start, end);
    const remainingAccountsSlice = [...memberSlice, ...bagSlice];
    const mintIns = await program.methods
      .multipleMint(memberSlice.length, new anchor.BN(amount))
      .accounts(multipleMintAccounts)
      .remainingAccounts(remainingAccountsSlice)
      .instruction();
    const rs = await sendV0Transaction(
      connection,
      admin,
      [mintIns],
      [lookupTableAccounts]
    );
    if (rs) {
      txns[1 + noOfExtendsTxn + i].txid = rs;
      txns[1 + noOfExtendsTxn + i].status = 2;
      txns[1 + noOfExtendsTxn + i].msg = '✅ Minted txn succeeded';
      info(txns);
    } else {
      txns[1 + noOfExtendsTxn + i].txid = '';
      txns[1 + noOfExtendsTxn + i].status = 1;
      txns[1 + noOfExtendsTxn + i].msg = '🛑 Minted txn failed';
    }
  }
  success('✅ All mints are done!');
};

export default multipleMint;
