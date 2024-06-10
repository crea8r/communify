const { getSessions } = require('../state/sessions');
const constants = require('../constants');
const anchor = require('@coral-xyz/anchor');
const { getConnection } = require('../state/connection');
const { CommunityAccountSchema } = require('../services/_scheme');

// to register group id
const register = (ctx) => {
  const username = ctx.update.message.from.username;
  const sessions = getSessions();
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    const chatId = ctx.update.message.chat.id;
    const connection = getConnection();
    const userPublicKey = new anchor.web3.PublicKey(
      sessions[username].publicKey
    );
    const [communityAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), userPublicKey.toBuffer()],
      constants.programId
    );
    try {
      connection.getAccountInfo(communityAccount).then((accountInfo) => {
        if (accountInfo) {
          const info = CommunityAccountSchema.decode(accountInfo.data);
          return ctx.reply(
            'You are admin of ' +
              info.symbol +
              ', now I will connect that with chatId ' +
              chatId +
              '!'
          );
        } else {
          return ctx.reply(
            'You are not admin of any community. Please go to https://communify.com to create one!'
          );
        }
      });
    } catch (e) {
      return ctx.reply(
        'You are not admin of any community. Please go to https://communify.com to create one!'
      );
    }
  }
};

// ctx.update.message.chat.id is the group id
/**
 * {
  update_id: 749989025,
  message: {
    message_id: 217,
    from: {
      id: 6422334977,
      is_bot: false,
      first_name: 'Justin',
      last_name: '🔨🇬🇧',
      username: 'JustInSolana'
    },
    chat: {
      id: -1002002393144,
      title: 'Communify',
      username: 'communifysol',
      type: 'supergroup'
    },
    date: 1717934254,
    text: '/connect',
    entities: [ [Object] ]
  }
}
 */

module.exports = register;
