const { TelegramMemberInfoSchema, MemberInfoSchema } = require('../_scheme');
const constants = require('../../constants');
const bs58 = require('bs58');
const idl = require('../../idl.json');

const fetchMemberFromTelegram = async (
  connection,
  communityAccount,
  telegramUsername
) => {
  try {
    console.log('telegramUsername: ', telegramUsername);
    const responses = await connection.getProgramAccounts(constants.programId, {
      dataSlice: { offset: 0, length: 8 + 32 + 32 + 51 },
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: bs58.encode(
              idl.accounts.filter((acc) => acc.name === 'TelegramMemberInfo')[0]
                .discriminator
            ),
          },
        },
        {
          memcmp: {
            offset: 8 + 32,
            bytes: communityAccount.toBase58(),
          },
        },
        // string takes first 4 bytes for length
        {
          memcmp: {
            offset: 8 + 32 + 32 + 4,
            bytes: bs58.encode(Buffer.from(telegramUsername)),
          },
        },
      ],
    });
    if (responses.length === 0) {
      return false;
    } else {
      const telegramMemberInfo = TelegramMemberInfoSchema.decode(
        responses[0].account.data
      );
      try {
        const memberInfo = await connection.getAccountInfo(
          telegramMemberInfo.memberInfo
        );
        if (memberInfo) {
          const decoded = MemberInfoSchema.decode(memberInfo.data);
          return {
            member: decoded.member,
            memberInfo: telegramMemberInfo.memberInfo,
            max: decoded.max,
            status: decoded.status,
          };
        }
      } catch (e) {
        return false;
      }
    }
  } catch (error) {
    return false;
  }
};

module.exports = fetchMemberFromTelegram;
