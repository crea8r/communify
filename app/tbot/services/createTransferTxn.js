const anchor = require('@coral-xyz/anchor');
const borsh = require('@coral-xyz/borsh');
const programId = new anchor.web3.PublicKey(
  'Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok'
);
const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);
const createTransferTxn = async ({ connection, sender, receiver, amount }) => {
  const clockInfo = await connection.getAccountInfo(
    anchor.web3.SYSVAR_CLOCK_PUBKEY
  );
  let currentUnixTimestamp = new Date().getTime() / 1000;
  if (clockInfo) {
    const clockData = CLOCK_LAYOUT.decode(clockInfo.data);
    currentUnixTimestamp = clockData.unix_timestamp.toNumber();
  }
};
module.exports = createTransferTxn;
