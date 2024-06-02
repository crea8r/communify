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
