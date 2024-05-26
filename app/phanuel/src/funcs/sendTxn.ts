import * as anchor from '@coral-xyz/anchor';
import { BlockheightBasedTransactionConfirmationStrategy } from '@solana/web3.js';
const sendTxn = async (connection: any, transaction: any, feePayer: any) => {
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = feePayer.publicKey;
  // console.log('in sendTxn ; transaction: ', transaction);
  const signedTransaction = await feePayer.signTransaction(transaction);
  // console.log('signedTransaction: ', signedTransaction);
  // console.log('feePayer: ', feePayer);
  const sendOptions = {
    skipPreflight: false,
    preflightCommitment: 'finalized',
    maxRetries: 10,
  };
  // const sendOptions = {
  //   skipPreflight: true,
  //   preflightCommitment: 'confirmed',
  //   maxRetries: 0,
  // };
  const signature = await connection.sendRawTransaction(
    signedTransaction.serialize(),
    sendOptions
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  console.log('latestBlockHash: ', latestBlockHash);
  const confirmStrategy: BlockheightBasedTransactionConfirmationStrategy = {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  };
  return connection.confirmTransaction(signature, confirmStrategy);
};

export default sendTxn;
