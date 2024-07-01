import * as borsh from '@coral-xyz/borsh';

export const MemberInfoAccountSchema = borsh.struct([
  borsh.publicKey('member'),
  borsh.u64('max'),
  borsh.u8('status'),
]);
export const FullMemberInfoAccountSchema = borsh.struct([
  borsh.publicKey('community'),
  borsh.publicKey('member'),
  borsh.u64('max'),
  borsh.u8('status'),
]);
export const BagInfoSchema = borsh.struct([
  borsh.u64('amount'),
  borsh.u64('decayAt'),
]);
export const MemoSchema = borsh.struct([
  borsh.publicKey('community'),
  borsh.publicKey('from'),
  borsh.publicKey('to'),
  borsh.u64('amount'),
  borsh.str('note'),
]);
export const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);
