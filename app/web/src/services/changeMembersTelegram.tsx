import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../funcs/config';
import { PublicKey } from '@solana/web3.js';
import sendTxn from '../funcs/sendTxn';

const changeMembersTelegram = async ({
  memberInfos,
  admin,
  usernames,
  success,
  err,
  fin,
}: {
  memberInfos: PublicKey[];
  usernames: string[];
  admin: anchor.Wallet;
  success: any;
  err?: any;
  fin: any;
}) => {
  const program = getProgram();
  const intructions = [];
  for (var i = 0; i < memberInfos.length; i++) {
    const memberInfoPDA = memberInfos[i];
    const username = usernames[i];
    const [telegramMemberInfo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('TelegramMemberInfo'), memberInfoPDA.toBuffer()],
      program.programId
    );
    const [communityAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('MINT'), admin.publicKey.toBuffer()],
      program.programId
    );
    const mutMemberTelegramAccounts = {
      telegramMemberInfo,
      memberInfo: memberInfoPDA,
      communityAccount,
      admin: admin.publicKey,
    };
    intructions.push(
      await program.methods
        .mutMemberTelegram(username)
        .accounts(mutMemberTelegramAccounts)
        .instruction()
    );
  }
  const txn = new anchor.web3.Transaction();
  txn.add(...intructions);
  sendTxn(program.provider.connection, txn, admin)
    .then((data) => {
      success(data);
    })
    .catch((e: any) => {
      if (err) err(e);
      console.error('Error changing telegram username: ', e);
    })
    .finally(() => fin());
};

export default changeMembersTelegram;
