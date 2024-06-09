import * as anchor from '@coral-xyz/anchor';
import { BlockheightBasedTransactionConfirmationStrategy } from '@solana/web3.js';
const sendTxn = async (
  connection: any,
  transaction: any,
  feePayer: anchor.Wallet
) => {
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = feePayer.publicKey;
  console.log(
    'in sendTxn ; feePayer: ',
    feePayer.publicKey.toBase58(),
    '; ',
    feePayer
  );
  const signedTransaction = await feePayer.signTransaction(transaction);
  console.log('signedTransaction: ', signedTransaction);
  console.log('feePayer: ', feePayer);
  // const sendOptions = {
  //   skipPreflight: true,
  //   // preflightCommitment: 'finalized',
  //   // maxRetries: 10,
  // };
  const sendOptions = {
    skipPreflight: true,
    preflightCommitment: 'confirmed',
    maxRetries: 10,
  };
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    sendOptions
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  };
  console.log('signature: ', signature);
  return connection.confirmTransaction(signature, confirmStrategy);
};

export default sendTxn;
