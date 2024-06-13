const anchor = require('@coral-xyz/anchor');
const borsh = require('@coral-xyz/borsh');
const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);
const { getConnection } = require('../state/connection');
const fetchMemberFromTelegram = require('./lib/fetchMemberFromTelegram');
const fetchCommunityPublicKey = require('./lib/fetchCommunityPublicKey');
const fetchAllBags = require('./lib/fetchAllBags');
const constants = require('../constants');
const idl = require('../idl.json');
const base58 = require('bs58');

const createTransferTxn = async ({
  senderAddress,
  communityChatId,
  receiverUsername,
  amount,
  note,
}) => {
  const connection = getConnection();
  if (!connection) {
    return 'Something went wrong, contact support!';
  }
  const clockInfo = await connection.getAccountInfo(
    anchor.web3.SYSVAR_CLOCK_PUBKEY
  );
  let currentUnixTimestamp = new Date().getTime() / 1000;
  if (clockInfo) {
    const clockData = CLOCK_LAYOUT.decode(clockInfo.data);
    currentUnixTimestamp = clockData.unix_timestamp.toNumber();
  }
  // what is recevier address from the username?
  const communityAccountPublicKey = await fetchCommunityPublicKey(
    connection,
    communityChatId
  );
  if (!communityAccountPublicKey) {
    return 'Community not found';
  }
  const receiver = await fetchMemberFromTelegram(
    connection,
    communityAccountPublicKey,
    receiverUsername
  );
  if (!receiver) {
    return 'Receiver not found';
  }
  const receiverPublicKey = receiver.member;
  // what is recevier's memberInfo PDA?
  const receiverInfo = receiver.memberInfo;
  // what bags are available for the sender? and amount of each bags
  const senderBags = await fetchAllBags(
    connection,
    communityAccountPublicKey,
    new anchor.web3.PublicKey(senderAddress)
  );
  let balance = 0;
  let spendableBags = [];
  for (var i = 0; i < senderBags.length; i++) {
    if (
      senderBags[i].amount.toNumber() > 0 &&
      currentUnixTimestamp < senderBags[i].decay_at.toNumber()
    ) {
      balance += senderBags[i].amount.toNumber();
      spendableBags.push(senderBags[i]);
    }
  }
  if (balance < amount) {
    return 'Insufficient balance';
  }
  spendableBags.sort((a, b) => {
    return a.decay_at.toNumber() - b.decay_at.toNumber();
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
  // create receiver bag PDA
  const [receiverBag] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Bag'),
      receiverInfo.toBuffer(),
      receiver.max.toArrayLike(Buffer, 'le', 8),
    ],
    constants.programId
  );
  const toSpendAmountsU64 = toSpendAmounts.map((a) => {
    return new anchor.BN(a);
  });
  // create memo PDA
  const memoPDA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Memo'),
      receiverInfo.toBuffer(),
      receiver.max.toArrayLike(Buffer, 'le', 8),
    ],
    constants.programId
  );
  // create transferAccounts: sender, member, receiverInfo, bag, communityAccount, program, clock, senderInfo, memo
  const sender = new anchor.web3.PublicKey(senderAddress);
  const accounts = {
    sender,
    member: receiverPublicKey,
    phanuelProgram: constants.programId,
    receiverInfo: receiverInfo,
    bag: receiverBag,
    communityAccount: communityAccountPublicKey,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    senderInfo: anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('User'),
        communityAccountPublicKey.toBuffer(),
        sender.toBuffer(),
      ],
      constants.programId
    )[0],
    memo: memoPDA,
    systemProgram: anchor.web3.SystemProgram.programId,
  };
  toSpendBags.map((b) => {
    console.log(new Date(b.decay_at.toNumber() * 1000));
  });
  // construct the remainingAccounts
  const remainingAccounts = toSpendBags.map((b) => {
    return { pubkey: b.publicKey, isWritable: true, isSigner: false };
  });
  // console.log('remaining accounts: ', remainingAccounts);
  // console.log('to spend amounts: ', toSpendAmountsU64);
  const provider = new anchor.AnchorProvider(
    connection,
    { publicKey: senderAddress, signTransaction: connection.signTransaction },
    { preflightCommitment: 'confirmed' }
  );
  anchor.setProvider(provider);
  const program = new anchor.Program(idl, provider);
  const txn = await program.methods
    .transfer(toSpendAmountsU64, note)
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .transaction();
  txn.feePayer = sender;
  const { blockhash } = await connection.getLatestBlockhash();
  txn.recentBlockhash = blockhash;
  return txn;
};
module.exports = createTransferTxn;
