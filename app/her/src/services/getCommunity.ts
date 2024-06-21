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

const getCommunity = async (chat_id: string) => {
  // filter the blockchain for the community
  const chatId = new anchor.BN(chat_id);
  try {
    const connection = getConnection();
    const encoder = getI64Encoder();
    const telegramCommunity = await connection.getAccountInfo(
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
              bytes: bs58.encode(encoder.encode(chatId)),
            },
          },
        ],
      }
    );
    const telegramCommunityData = TelegramCommunitySchema.decode(
      telegramCommunity[0].account.data
    );
    const info = await connection.getAccountInfo(
      telegramCommunityData.community
    );
    return CommunityAccountSchema.decode(info.data);
  } catch (e) {
    console.log(e);
    return false;
  }
};

export default getCommunity;
