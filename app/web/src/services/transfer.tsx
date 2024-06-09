import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import idl from '../idl.json';
import { PublicKey } from '@solana/web3.js';
import * as borsh from '@coral-xyz/borsh';
import sendTxn from '../funcs/sendTxn';

const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);

export const transfer = async ({
  sender,
  receiver,
  amount,
  senderBags,
  communityAccount,
  note,
  success,
  error,
  fin,
}: {
  sender: anchor.Wallet;
  receiver: PublicKey;
  amount: number;
  senderBags: any[];
  communityAccount: PublicKey;
  note: string;
  success: (data: any) => void;
  error: (err: any) => void;
  fin: () => void;
}) => {
  const program = getProgram();
  let balance = 0;
  let spendableBags = [];
  const clockInfo = await program.provider.connection.getAccountInfo(
    anchor.web3.SYSVAR_CLOCK_PUBKEY
  );
  let currentUnixTimestamp = new Date().getTime() / 1000;
  if (clockInfo) {
    const clockData = CLOCK_LAYOUT.decode(clockInfo.data);
    currentUnixTimestamp = clockData.unix_timestamp.toNumber();
  }
  for (var i = 0; i < senderBags.length; i++) {
    if (
      senderBags[i].amount.toNumber() > 0 &&
      currentUnixTimestamp < senderBags[i].decayAt.toNumber()
    ) {
      balance += senderBags[i].amount.toNumber();
      spendableBags.push(senderBags[i]);
    }
  }
  if (balance < amount) {
    error('Insufficient balance');
    fin();
  } else {
  }
  spendableBags.sort((a, b) => {
    return a.decayAt.toNumber() - b.decayAt.toNumber();
  });
  let toSpendBags = [];
  let toSpendAmounts = [];
  let toSpend = amount;
  for (var i = 0; i < spendableBags.length; i++) {
    if (spendableBags[i].amount.toNumber() <= toSpend) {
      // then spend all
      toSpend -= spendableBags[i].amount.toNumber();
      toSpendBags.push(spendableBags[i]);
      toSpendAmounts.push(spendableBags[i].amount.toNumber());
    } else {
      // spend toSpend
      toSpendBags.push(spendableBags[i]);
      toSpendAmounts.push(toSpend);
      toSpend = 0;
      break;
    }
  }
  console.log('community account: ', communityAccount);
  const [receiverPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), communityAccount.toBuffer(), receiver.toBuffer()],
    program.programId
  );
  const receiverInfo = await program.account.memberInfo.fetch(receiverPDA);
  const [receiverBag] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Bag'),
      receiverPDA.toBuffer(),
      receiverInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  const toSpendAmountsU64 = toSpendAmounts.map((a) => {
    return new anchor.BN(a);
  });
  const memoPDA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Memo'),
      receiverPDA.toBuffer(),
      receiverInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  const accounts = {
    sender: sender.publicKey,
    member: receiver,
    phanuelProgram: program.programId,
    receiverInfo: receiverPDA,
    bag: receiverBag,
    communityAccount,
    phaneulProgram: program.programId,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    senderInfo: anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('User'),
        communityAccount.toBuffer(),
        sender.publicKey.toBuffer(),
      ],
      program.programId
    )[0],
    memo: memoPDA,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  toSpendBags.map((b) => {
    console.log(new Date(b.decayAt.toNumber() * 1000));
  });
  const remainingAccounts = toSpendBags.map((b) => {
    return { pubkey: b.publicKey, isWritable: true, isSigner: false };
  });
  console.log('remaining accounts: ', remainingAccounts);
  const txn = await program.methods
    .transfer(toSpendAmountsU64, note)
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .transaction();
  sendTxn(program.provider.connection, txn, sender)
    .then((data) => {
      if (data.err) {
        error(data);
      } else {
        console.log(data);
        success(data);
      }
    })
    .catch((e) => {
      console.error(e);
      error(e);
    })
    .finally(() => {
      fin();
    });
};

export default transfer;
