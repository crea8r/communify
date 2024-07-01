import { PublicKey } from '@solana/web3.js';
import getProgram from './_program';
import * as anchor from '@coral-xyz/anchor';
import * as bip39 from 'bip39';
import { MemberInfoAccountSchema } from './_schemas';
import getRenter from './_renter';

const mintTo = async ({
  adminMnemonic,
  communityAccount,
  receiver,
  amount,
}: {
  adminMnemonic: string;
  communityAccount: PublicKey;
  receiver: PublicKey;
  amount: number; // int
}) => {
  const admin = anchor.web3.Keypair.fromSeed(
    bip39.mnemonicToSeedSync(adminMnemonic).slice(0, 32)
  );
  const renter = getRenter(
    admin.publicKey.toBase58(),
    communityAccount.toBase58()
  );
  let program = getProgram(admin);
  const [memberInfoAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), communityAccount.toBuffer(), receiver.toBuffer()],
    program.programId
  );
  console.log('-- memberInfoAccount --', memberInfoAccount.toBase58());
  const rawMemberInfo = await program.provider.connection.getAccountInfo(
    memberInfoAccount
  );
  console.log('rawMemberInfo: ', rawMemberInfo);
  const memberInfo = MemberInfoAccountSchema.decode(rawMemberInfo?.data);
  console.log('-- memberInfo --', memberInfo);
  const [bagAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('Bag'),
      memberInfoAccount.toBuffer(),
      memberInfo.max.toArrayLike(Buffer, 'le', 8),
    ],
    program.programId
  );
  console.log('-- bagAccount --', bagAccount.toBase58());
  const accounts = {
    communityAccount,
    admin: admin.publicKey,
    bag: bagAccount,
    memberInfo: memberInfoAccount,
    member: receiver,
    phanuelProgram: program.programId,
    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    renter: renter.publicKey,
  };
  try {
    await program.methods
      .mintTo(new anchor.BN(amount))
      .accounts(accounts)
      .signers([admin, renter])
      .rpc();
  } catch (err) {
    return false;
  }
  return true;
};

export default mintTo;
