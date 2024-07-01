import * as anchor from '@coral-xyz/anchor';
const privateKeyStr = process.env.FEE_PAYER_SECRET || '';
const privateKeyArray = privateKeyStr.split(',').map(Number);
const privateKeyUint8Array = new Uint8Array(privateKeyArray);
const keypair = anchor.web3.Keypair.fromSecretKey(privateKeyUint8Array);

const getRenter = (username: string, group_id: string | undefined) => {
  // for each username & group_id (or chat_id of the group)
  // do some logic to find who will pay for the txn fee and state rent fee
  return keypair;
};

export default getRenter;
