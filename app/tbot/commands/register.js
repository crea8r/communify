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

module.exports = register;
