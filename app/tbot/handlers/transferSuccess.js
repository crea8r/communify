const transferSuccess = (req, res) => {
  const { amount, username } = req.query;
  const sessions = getSessions();
  const session = sessions[username].session;
  const sharedSecret = sessions[username].sharedSecret;
  const nonce = nacl.randomBytes(24);
  const data = {
    amount,
    session,
  };
  const encryptedData = nacl.box(
    Buffer.from(JSON.stringify(data)),
    nonce,
    sharedSecret
  );
  const encryptedData64 = base58.encode(encryptedData);
  const nonce64 = base58.encode(nonce);
  return res.render('transferSuccess', {
    encryptedData: encryptedData64,
    nonce: nonce64,
  });
};
module.exports = transferSuccess;
