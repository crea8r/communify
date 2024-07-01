// @ts-nocheck
import idl from './idl.json';
import { getI64Encoder } from '@solana/codecs-numbers';
import {
  CommunityAccountSchema,
  TelegramCommunityAccountSchema,
} from './_schemas';
import getConnection from '../config/connection';
import * as anchor from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import { TelegramCommunityAccountSchema } from './_schemas';
import { publicKey } from '@coral-xyz/borsh';

const getCommunity = async (chat_id: string) => {
  // filter the blockchain for the community
  console.log('chat_id: ', chat_id);
  try {
    const connection = getConnection();
    const encoder = getI64Encoder();
    const telegramCommunities = await connection.getProgramAccounts(
      new anchor.web3.PublicKey(idl.address),
      {
        dataSlice: { offset: 0, length: 8 + 32 + 8 },
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: bs58.encode(
                idl.accounts.filter(
                  (acc) => acc.name === 'TelegramCommunity'
                )[0].discriminator
              ),
            },
          },
          {
            memcmp: {
              offset: 8 + 32,
              bytes: bs58.encode(encoder.encode(chat_id)),
            },
          },
        ],
      }
    );
    console.log('telegramCommunities: ', telegramCommunities);
    if (telegramCommunities.length === 0) {
      console.log('no telegramCommunities found');
      return false;
    } else {
      const telegramCommunityData = TelegramCommunityAccountSchema.decode(
        telegramCommunities[0].account.data
      );
      const info = await connection.getAccountInfo(
        telegramCommunityData.community
      );
      console.log('community info: ', CommunityAccountSchema.decode(info.data));
      return {
        ...CommunityAccountSchema.decode(info.data),
        publicKey: telegramCommunityData.community,
      };
    }
  } catch (e) {
    return false;
  }
};

export default getCommunity;
