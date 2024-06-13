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
const TelegramCommunitySchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.publicKey('community'),
  borsh.i64('chat_id'),
]);
const TelegramMemberInfoSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.publicKey('memberInfo'),
  borsh.publicKey('community'),
  borsh.str('username'),
]);
const BagSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.publicKey('community'),
  borsh.publicKey('member'),
  borsh.u64('amount'),
  borsh.u64('decay_at'),
  borsh.u64('created_at'),
]);
const MemberInfoSchema = borsh.struct([
  borsh.u64('discriminator'),
  borsh.publicKey('community'),
  borsh.publicKey('member'),
  borsh.u64('max'),
  borsh.u8('status'),
]);

module.exports = {
  CommunityAccountSchema,
  CLOCK_LAYOUT,
  TelegramCommunitySchema,
  BagSchema,
  TelegramMemberInfoSchema,
  MemberInfoSchema,
};
