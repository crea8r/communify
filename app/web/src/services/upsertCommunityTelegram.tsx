import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../funcs/config';
import * as anchor from '@coral-xyz/anchor';
import sendTxn from '../funcs/sendTxn';

const upsertCommunityTelegram = async ({
  admin,
  chatId,
  success,
  err,
  fin,
}: {
  admin: anchor.Wallet;
  chatId: string;
  success: any;
  err?: any;
  fin: any;
}) => {
  const program = getProgram();
  const [communityPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), admin.publicKey.toBuffer()],
    program.programId
  );
  const [telegramCommunityPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('Telegram'), communityPDA.toBuffer()],
    program.programId
  );
  try {
    const accounts = {
      communityAccount: communityPDA,
      telegramCommunity: telegramCommunityPDA,
      admin: admin.publicKey,
    };
    const txn = await program.methods
      .mutCommunityTelegram(new anchor.BN(chatId))
      .accounts(accounts)
      .transaction();
    sendTxn(program.provider.connection, txn, admin)
      .then((data) => {
        success(data);
      })
      .catch((e) => {
        if (e) err(e);
        console.error('Error updating community telegram: ', e);
      })
      .finally(() => {
        fin();
      });
    success(txn);
    fin();
  } catch (e) {
    if (err) err(e);
    fin();
  }
};

export default upsertCommunityTelegram;
