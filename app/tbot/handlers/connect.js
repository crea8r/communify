const { decryptPayload } = require('../utils');
const { getSessions } = require('../state/sessions');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const constants = require('../constants');

const connect = (req, res) => {
  const sessions = getSessions();
  const phantom_encryption_public_key = req.query.phantom_encryption_public_key;
  const nonce = req.query.nonce;
  const data = req.query.data;
  const username = req.query.username;
  const dappKeyPair = sessions[username].kp;
  if (!phantom_encryption_public_key || !nonce || !data || !dappKeyPair) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const sharedSecretDapp = nacl.box.before(
    bs58.decode(phantom_encryption_public_key),
    dappKeyPair.secretKey
  );
  const connectData = decryptPayload(data, nonce, sharedSecretDapp);
  sessions[username].session = connectData.session;
  sessions[username].sharedSecret = sharedSecretDapp;
  //TODO: publicKey is the user address, should changed to userAddress in the next refactor
  sessions[username].publicKey = connectData.public_key;

  // should go back where he came from!
  return res.render('connect', {
    url:
      'https://t.me/' +
      constants.botName +
      '?start=' +
      sessions[username].publicKey,
  });
};

module.exports = connect;
