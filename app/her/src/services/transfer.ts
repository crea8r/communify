import getCommunity from './getCommunity';
import * as bip39 from 'bip39';
import * as anchor from '@coral-xyz/anchor';
import getConnection from '../config/connection';
import getRenter from './_renter';
import getProgram from './_program';
import { CLOCK_LAYOUT, MemberInfoAccountSchema } from './_schemas';
import listAllBagAccounts from './listAllBags';

const transfer = async (
  senderMnemonic: string,
  receiverMnemonic: string,
  group_id: string,
  amount: number,
  note: string
) => {
  const community = await getCommunity(group_id);
  if (!community) {
    return { data: null, error: 'Community not found' };
  }
  const sender = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(senderMnemonic).slice(0, 32)
  );
  // find all sender bags
  const receiver = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(receiverMnemonic).slice(0, 32)
  );
  const renter = getRenter(sender.publicKey.toBase58(), group_id);
  const program = getProgram(renter);
  const connection = getConnection();
  const communityAccount = community.publicKey;
  const [receiverPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('User'),
      communityAccount.toBuffer(),
      receiver.publicKey.toBuffer(),
    ],
    program.programId
  );
  let receiverRawInfo;
  try {
    receiverRawInfo = await connection.getAccountInfo(receiverPDA);
  } catch (e) {
    console.log(e);
    return {
      data: null,
      error: 'Receiver not found, ask him to /join the community',
    };
  }
  const receiverInfo = MemberInfoAccountSchema.decode(receiverRawInfo?.data);

  const senderBags = await listAllBagAccounts({
    memberMenmonic: senderMnemonic,
    communityAccount,
  });
  // Transfer logic: get bags, calculate new bags, update bags
  let balance = 0;
  let spendableBags = [];
  const clockInfo = await connection.getAccountInfo(
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
    return {
      data: null,
      error: 'Insufficient balance',
    };
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
    renter: sender.publicKey,
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
  try {
    await program.methods
      .transfer(toSpendAmountsU64, note)
      .accounts(accounts)
      .remainingAccounts(remainingAccounts)
      .signers([sender, renter])
      .rpc();
  } catch (err) {
    return false;
  }
  return true;
};

export default transfer;
