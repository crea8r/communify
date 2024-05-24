import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../funcs/config';
import sendTxn from '../funcs/sendTxn';
import * as anchor from '@coral-xyz/anchor';

export type CreateCommunityProps = {
  admin: anchor.Wallet;
  tokenSymbol: string;
  decayTime: number;
  success: any;
  error?: any;
  fin: any;
};

export const create = async ({
  admin,
  tokenSymbol,
  decayTime,
  success,
  error,
  fin,
}: CreateCommunityProps) => {
  let program = getProgram();
  const txn = await program.methods
    .create(tokenSymbol, new anchor.BN(decayTime))
    .accounts({
      admin: admin.publicKey,
      communityAccount: anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('MINT'), admin.publicKey.toBuffer()],
        program.programId
      )[0],
    })
    .transaction();
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      console.log('trigger success callback ', data);
      success();
    })
    .catch((e) => {
      alert('Error creating token: ' + e.message);
      if (error) error();
    })
    .finally(() => {
      if (fin) fin();
    });
};

export default {
  create,
};
