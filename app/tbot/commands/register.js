const { getSessions } = require('../state/sessions');

// to register group id
const register = (ctx) => {
  const username = ctx.update.message.from.username;
  const sessions = getSessions();
  if (
    sessions[username] &&
    sessions[username].session &&
    sessions[username].publicKey
  ) {
    console.log(ctx);
    console.log(sessions[username].publicKey);
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), wallet.publicKey.toBuffer()],
      program.programId
    );
    return ctx.reply('You are already connected!');
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
