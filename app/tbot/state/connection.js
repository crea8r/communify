const connection = new web3.Connection(process.env.SOLANA_RPC_URL, {
  commitment: 'finalized',
});

const getConnection = () => connection;

module.exports = {
  getConnection,
};
