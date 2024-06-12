const { CommunityAccountSchema } = require('./_scheme');
const { getConnection } = require('../state/connection');
const anchor = require('@coral-xyz/anchor');
const fetchCommunityPublicKey = require('./lib/fetchCommunityPublicKey');
const fetchAllBags = require('./lib/fetchAllBags');

// username: telegram username, chatId: telegram group chat id
const viewBalance = async (memberPublicKey, chatId) => {
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
  const bags = await fetchAllBags(
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
