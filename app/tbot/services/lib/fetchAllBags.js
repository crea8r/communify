const bs58 = require('bs58');
const idl = require('../../idl.json');
const { BagSchema } = require('../_scheme');
const constants = require('../../constants');

const fetchAllBags = async (connection, communityAccount, memberAccount) => {
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

module.exports = fetchAllBags;
