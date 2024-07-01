import { web3 } from '@coral-xyz/anchor';
import init from './init';
// admin
import createCommunity from './admin/createCommunity';
import updateCommunity from './admin/updateCommunity';
import upsertCommunityTelegram from './admin/upsertCommunityTelegram';
import changeMembersTelegram from './admin/changeMembersTelegram';
import addMember from './admin/addMember';
import disableMember from './admin/disableMember';
import mintTo from './admin/mintTo';
// members
import transfer from './member/transfer';
import balance from './member/balance';
import listAllBagAccounts from './member/listAllBagAccounts';
import listReceivedNotes from './member/listReceivedNotes';
import listSentNotes from './member/listSentNotes';
import listAllCommunity from './member/listAllCommunity';
import {
  // Admin
  CreateCommunityProps,
  UpdateCommunityProps,
  UpsertCommunityTelegramProps,
  MutMemberProps,
  MutMemberTelegramProps,
  AddMemberProps,
  MintToProps,
  // Member
  TransferProps,
  MemberReaderProps,
} from './_props';
import { PublicKey } from '@solana/web3.js';

export default class SDK {
  constructor(connection: web3.Connection, sender: web3.PublicKey) {
    init(connection, sender);
  }
  async createCommunity(params: CreateCommunityProps) {
    return await createCommunity(params);
  }
  async updateCommunity(params: UpdateCommunityProps) {
    return await updateCommunity(params);
  }
  async addMember(params: AddMemberProps) {
    return await addMember(params);
  }

  async upsertCommunityTelegram(params: UpsertCommunityTelegramProps) {
    return await upsertCommunityTelegram(params);
  }
  async changeMembersTelegram(params: MutMemberTelegramProps) {
    return await changeMembersTelegram(params);
  }
  async disableMember(params: MutMemberProps) {
    return await disableMember(params);
  }
  async mintTo(params: MintToProps) {
    return await mintTo(params);
  }
  async transfer(params: TransferProps) {
    return await transfer(params);
  }
  async balance(params: MemberReaderProps) {
    return await balance(params);
  }
  async listAllBagAccounts(params: MemberReaderProps) {
    return await listAllBagAccounts(params);
  }
  async listReceivedNotes(params: MemberReaderProps) {
    return await listReceivedNotes(params);
  }
  async listSentNotes(params: MemberReaderProps) {
    return await listSentNotes(params);
  }
  async listAllCommunity(params: { member: PublicKey }) {
    return await listAllCommunity(params);
  }
}
