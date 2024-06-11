const idl = require('../idl.json');
const { TelegramCommunitySchema } = require('../services/_scheme');
const { getI64Encoder } = require('@solana/codecs-numbers');
const { BagSchema, CommunityAccountSchema } = require('../services/_scheme');
const bs58 = require('bs58');
const constants = require('../constants');
const { getConnection } = require('../state/connection');
const anchor = require('@coral-xyz/anchor');

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

const fetchAllBag = async (connection, communityAccount, memberAccount) => {
  try {
    const bags = await connection.getProgramAccounts(constants.programId, {
      dataSlice: { offset: 0, length: 8 + 32 + 32 + 8 + 8 + 8 },
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(
              idl.accounts.filter((acc) => acc.name === 'Bag')[0].discriminator
            ),
          },
        },
        {
          memcmp: {
            offset: 8,
            bytes: communityAccount.toBase58(),
          },
        },
        {
          memcmp: {
            offset: 8 + 32,
            bytes: memberAccount.toBase58(),
          },
        },
      ],
    });
    return bags.map((bag) => BagSchema.decode(bag.account.data));
  } catch (error) {
    console.log(error);
    return false;
  }
};

// username: telegram username, chatId: telegram group chat id
const viewBalance = async (memberPublicKey, chatId) => {
  console.log(
    'viewBalance, memberPublicKey: ',
    memberPublicKey,
    ', chatId: ',
    chatId
  );
  const connection = getConnection();
  if (!connection) {
    return 'Something went wrong, contact support!';
  }
  const communityPublicKey = await fetchCommunityPublicKey(connection, chatId);
  if (!communityPublicKey) {
    return 'Community not found!';
  }
  const communityAccountInfo = await connection.getAccountInfo(
    communityPublicKey
  );
  const info = CommunityAccountSchema.decode(communityAccountInfo.data);
  const bags = await fetchAllBag(
    connection,
    communityPublicKey,
    new anchor.web3.PublicKey(memberPublicKey)
  );
  let _total = 0;
  bags.map((bag) => {
    let d = new Date(bag.decay_at.toNumber() * 1000);
    if (d < new Date()) {
      bag.decayed = true;
    } else {
      _total += bag.amount.toNumber();
    }
  });
  return 'Total: ' + _total + ' ' + info.symbol;
};

module.exports = viewBalance;
