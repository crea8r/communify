import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type UpdateCommunityProps = {
  admin: anchor.Wallet;
  tokenSymbol: string;
  decayTime: number;
  success: any;
  error?: any;
  fin: any;
};

export type MultipleMintProps = {
  admin: anchor.Wallet;
  receivers: PublicKey[];
  amount: number;
  info: any;
  success: any;
  error: any;
};

export type MultipleAddMemberProps = {
  admin: anchor.Wallet;
  newMembers: PublicKey[];
  info: any;
  success: any;
  error: any;
};

export type MutMemberProps = {
  admin: anchor.Wallet;
  communityAccountPubKey: PublicKey;
  member: PublicKey;
  success: (data: any) => void;
  error?: (err: any) => void;
  fin?: () => void;
};
