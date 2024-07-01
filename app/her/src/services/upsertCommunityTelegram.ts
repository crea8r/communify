import { PublicKey } from '@solana/web3.js';
import getProgram from './_program';
import * as anchor from '@coral-xyz/anchor';
import * as bip39 from 'bip39';
import getRenter from './_renter';

const upsertCommunityTelegram = async ({
  adminUserName,
  adminMnemonic,
  communityAccount,
  chatId,
}: {
  adminUserName: string;
  adminMnemonic: string;
  communityAccount: PublicKey;
  chatId: string;
}) => {
  const admin = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(adminMnemonic).slice(0, 32)
  );
  const renter = getRenter(adminUserName, chatId);
  const program = getProgram(renter);
  const [telegramCommunityPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('Telegram'), communityAccount.toBuffer()],
    program.programId
  );
  console.log('telegramCommunityPDA', telegramCommunityPDA.toBase58());
  try {
    const accounts = {
      communityAccount,
      telegramCommunity: telegramCommunityPDA,
      admin: admin.publicKey,
      renter: renter.publicKey,
    };
    const txn = await program.methods
      .mutCommunityTelegram(new anchor.BN(chatId))
      .accounts(accounts)
      .signers([admin, renter])
      .rpc();
    console.log('txn create telegram: ', txn);
  } catch (e) {
    console.log('error creating telegram: ', e);
    return false;
  }
  return true;
};

export default upsertCommunityTelegram;
