import getProgram from './_program';
import * as bip39 from 'bip39';
import * as anchor from '@coral-xyz/anchor';
import getConnection from '../config/connection';
import { CommunityAccountSchema } from './_schemas';
import getRenter from './_renter';

const createCommunity = async (
  mnemonic: string, // to sign the txn
  symbol: string,
  expire: number // expire in days
) => {
  const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  const admin = anchor.web3.Keypair.fromSeed(seed);
  const renter = getRenter(admin.publicKey.toBase58(), undefined);
  const program = getProgram(renter);
  const connection = getConnection();
  const rand = anchor.web3.Keypair.generate();
  const communityAccount = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), rand.publicKey.toBuffer()],
    program.programId
  )[0];
  const accounts = {
    admin: admin.publicKey,
    random: rand.publicKey,
    communityAccount,
    renter: renter.publicKey,
  };
  try {
    await program.methods
      .create(symbol, new anchor.BN(expire))
      .accounts(accounts)
      .signers([admin, renter])
      .rpc();
    const rs = await connection.getAccountInfo(communityAccount);
    return {
      data: {
        ...CommunityAccountSchema.decode(rs?.data),
        publicKey: communityAccount,
      },
      error: null,
    };
  } catch (e: any) {
    console.log('Error creating community: ', e);
    return {
      data: null,
      error: e,
    };
  }
};

export default createCommunity;
