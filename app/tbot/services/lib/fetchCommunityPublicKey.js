const { TelegramCommunitySchema } = require('../_scheme');
const { getI64Encoder } = require('@solana/codecs-numbers');
const bs58 = require('bs58');
const idl = require('../../idl.json');
const constants = require('../../constants');

const fetchCommunityPublicKey = async (connection, chatId) => {
  try {
    const encoder = getI64Encoder();
    const telegramCommunity = await connection.getProgramAccounts(
      constants.programId,
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
    return telegramCommunityData.community;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = fetchCommunityPublicKey;
