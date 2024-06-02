import { getProgram } from '../funcs/config';
import sendTxn from '../funcs/sendTxn';
import * as anchor from '@coral-xyz/anchor';
import { UpdateCommunityProps } from './_types';

const update = async ({
  admin,
  tokenSymbol,
  decayTime,
  success,
  error,
  fin,
}: UpdateCommunityProps) => {
  let program = getProgram();
  const accounts = {
    communityAccount: anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), admin.publicKey.toBuffer()],
      program.programId
    )[0],
    admin: admin.publicKey,
  };
  const txn = await program.methods
    .update(tokenSymbol, new anchor.BN(decayTime))
    .accounts(accounts)
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      console.log('trigger success callback ', data);
      success();
    })
    .catch((e) => {
      alert('Error updating token: ' + e.message);
      if (error) error();
    })
    .finally(() => {
      if (fin) fin();
    });
};

export default update;
