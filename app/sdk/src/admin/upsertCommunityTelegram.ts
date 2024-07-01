import { PublicKey } from '@solana/web3.js';
import { getProgram } from '../init';
import * as anchor from '@coral-xyz/anchor';
import { UpsertCommunityTelegramProps } from '../_props';

const upsertCommunityTelegram = async ({
  admin,
  chatId,
  community,
  renter,
}: UpsertCommunityTelegramProps) => {
  const program = getProgram();
  const [telegramCommunityPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('Telegram'), community.toBuffer()],
    program.programId
  );
  try {
    const accounts = {
      communityAccount: community,
      telegramCommunity: telegramCommunityPDA,
      admin,
      renter,
    };
    const txn = await program.methods
      .mutCommunityTelegram(new anchor.BN(chatId))
      .accounts(accounts)
      .transaction();
    return {
      transaction: txn,
      data: {
        telegramCommunity: telegramCommunityPDA,
      },
    };
  } catch (e) {
    return {
      error: e,
    };
  }
};

export default upsertCommunityTelegram;
