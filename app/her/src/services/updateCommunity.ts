import getProgram from './_program';
import * as anchor from '@coral-xyz/anchor';
import * as bip39 from 'bip39';
import getRenter from './_renter';

const update = async ({
  adminMnemonic,
  tokenSymbol,
  decayTime,
}: {
  adminMnemonic: string;
  tokenSymbol: string;
  decayTime: number;
}) => {
  const admin = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(adminMnemonic).slice(0, 32)
  );
  let program = getProgram(admin);
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
};

export default update;
