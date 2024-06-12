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

const createTransferTxn = async ({
  senderAddress,
  communityChatId,
  receiverUsername,
  amount,
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
  // what is recevier's memberInfo PDA?
  // what bags are available for the sender? and amount of each bags
  // create receiver bag PDA
  // create memo PDA
  // create transferAccounts: sender, member, receiverInfo, bag, communityAccount, program, clock, senderInfo, memo
  // construct the remainingAccounts
};
module.exports = createTransferTxn;
