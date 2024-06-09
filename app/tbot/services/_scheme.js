const borsh = require('@coral-xyz/borsh');
const CommunityAccountSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.u64('decay_after'),
  borsh.publicKey('admin'),
  borsh.str('symbol'),
]);
const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);
module.exports = {
  CommunityAccountSchema,
  CLOCK_LAYOUT,
};
