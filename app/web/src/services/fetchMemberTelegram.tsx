import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getProgram } from '../funcs/config';

const fetchMemberTelegram = async (memberInfoPDA: PublicKey) => {
  const program = getProgram();
  const [memberTelegram] = await anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('TelegramMemberInfo'), memberInfoPDA.toBuffer()],
    program.programId
  );
  try {
    return await program.account.telegramMemberInfo.fetch(memberTelegram);
  } catch (e) {
    return null;
  }
};
export default fetchMemberTelegram;
