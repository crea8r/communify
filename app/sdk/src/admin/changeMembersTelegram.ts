import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../init';
import { MutMemberTelegramProps } from '../_props';

const changeMembersTelegram = async ({
  memberInfos,
  admin,
  usernames,
  renter,
  community,
}: MutMemberTelegramProps) => {
  const program = getProgram();
  const intructions = [];
  const telegramMemberInfos = [];
  for (var i = 0; i < memberInfos.length; i++) {
    const memberInfoPDA = memberInfos[i];
    const username = usernames[i];
    const [telegramMemberInfo] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('TelegramMemberInfo'), memberInfoPDA.toBuffer()],
      program.programId
    );
    telegramMemberInfos.push(telegramMemberInfo);
    const mutMemberTelegramAccounts = {
      telegramMemberInfo,
      memberInfo: memberInfoPDA,
      communityAccount: community,
      admin,
      renter,
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
  return {
    transaction: txn,
    data: {
      telegramMemberInfos,
    },
  };
};

export default changeMembersTelegram;
