const anchor = require('@coral-xyz/anchor');

const port = process.env.PORT || 9000;
const baseURI = 'http://165.232.131.34:' + port;
const botName = 'communify_update_bot';
const metaDataURI = baseURI + '/meta';
const connectURI = baseURI + '/connect';

module.exports = {
  programId: new anchor.web3.PublicKey(
    'Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok'
  ),
  baseURI,
  botName,
  metaDataURI,
  connectURI,
  port,
};
