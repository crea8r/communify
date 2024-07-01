import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type CreateCommunityProps = {
  admin: PublicKey;
  tokenSymbol: string;
  decayDays: number;
  renter: PublicKey;
};

export type UpdateCommunityProps = {
  admin: PublicKey;
  tokenSymbol: string;
  decayDays: number;
  community: PublicKey;
};

export type UpsertCommunityTelegramProps = {
  admin: PublicKey;
  community: PublicKey;
  renter: PublicKey;
  chatId: string;
};

export type AddMemberProps = {
  admin: PublicKey;
  community: PublicKey;
  member: PublicKey;
  renter: PublicKey;
};

export type MutMemberProps = {
  admin: PublicKey;
  community: PublicKey;
  memberInfo: PublicKey;
  renter?: PublicKey;
};

export type MutMemberTelegramProps = {
  memberInfos: PublicKey[];
  usernames: string[];
  admin: PublicKey;
  renter: PublicKey;
  community: PublicKey;
};

export type MintToProps = {
  admin: PublicKey;
  receiver: PublicKey;
  community: PublicKey;
  renter: PublicKey;
  amount: number;
};

export type TransferProps = {
  sender: PublicKey;
  receiver: PublicKey;
  renter: PublicKey;
  amount: number;
  community: PublicKey;
  note: string;
};

export type MemberReaderProps = {
  member: PublicKey;
  community: PublicKey;
};
