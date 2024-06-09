const anchor = require('@coral-xyz/anchor');
const connection = new anchor.web3.Connection(process.env.SOLANA_RPC_URL, {
  commitment: 'finalized',
});

const getConnection = () => connection;

module.exports = {
  getConnection,
};
