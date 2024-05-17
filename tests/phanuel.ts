import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Phanuel } from '../target/types/phanuel';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import fs from 'fs';
import * as borsh from '@coral-xyz/borsh';

export default function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}

const CLOCK_LAYOUT = borsh.struct([
  borsh.u64('slot'),
  borsh.u64('epoch_start_timestamp'),
  borsh.u64('epoch'),
  borsh.u64('leader_schedule_epoch'),
  borsh.u64('unix_timestamp'),
]);

describe('phanuel', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Phanuel as Program<Phanuel>;
  const systemProgram = anchor.web3.SystemProgram;
  const admin = anchor.workspace.Phanuel.provider.wallet
    .payer as anchor.web3.Keypair;
  const w1 = loadKeypairFromFile('./tests/w1.json');
  const w2 = loadKeypairFromFile('./tests/w2.json');
  const [TokenPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('MINT'), admin.publicKey.toBuffer()],
    program.programId
  );
  const [w1PDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), TokenPDA.toBuffer(), w1.publicKey.toBuffer()],
    program.programId
  );
  const [w2PDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('User'), TokenPDA.toBuffer(), w2.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    let txn = new anchor.web3.Transaction();
    txn.add(
      systemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: w1.publicKey,
        lamports: 10_000_000_000, // 10 SOL
      })
    );
    txn.add(
      systemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: w2.publicKey,
        lamports: 10_000_000_000, // 10 SOL
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      program.provider.connection,
      txn,
      [admin]
    );
    // console.log('* Setup complete');
  });
  let decay = new anchor.BN(89890);

  it('Create token!', async () => {
    let symbol = 'TEST';
    const txn = await program.methods
      .create(symbol, decay)
      .accounts({
        communityAccount: TokenPDA,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();
    try {
      const TokenInfo = await program.account.communityAccount.fetch(TokenPDA);
      assert.equal(TokenInfo.decayAfter.toNumber(), decay.toNumber());
    } catch (e) {
      console.log('Token Not Existed; error', e);
      assert.ok(false);
    }
  });
  it('Add member!', async () => {
    const txn = await program.methods
      .addMember()
      .accounts({
        communityAccount: TokenPDA,
        memberInfo: w1PDA,
        admin: admin.publicKey,
        member: w1.publicKey,
        phanuelProgram: program.programId,
      })
      .signers([admin])
      .rpc();
    try {
      const w1Info = await program.account.memberInfo.fetch(w1PDA);
      assert.equal(w1Info.member.toBase58(), w1.publicKey.toBase58());
      assert.equal(w1Info.max.toNumber(), 0);
      assert.equal(w1Info.community.toBase58(), TokenPDA.toBase58());
    } catch (e) {
      console.error('No member, error', e);
      assert.ok(false);
    }
  });
  it('Remove member', async () => {
    await program.methods
      .addMember()
      .accounts({
        communityAccount: TokenPDA,
        memberInfo: w2PDA,
        admin: admin.publicKey,
        member: w2.publicKey,
        phanuelProgram: program.programId,
      })
      .signers([admin])
      .rpc();
    try {
      const w2Info = await program.account.memberInfo.fetch(w2PDA);
      assert.equal(w2Info.member.toBase58(), w2.publicKey.toBase58());
      assert.equal(w2Info.max.toNumber(), 0);
      assert.equal(w2Info.community.toBase58(), TokenPDA.toBase58());
    } catch (e) {
      // console.error('No member, error', e);
      assert.ok(false, 'Cannot add w2');
    }
    await program.methods
      .removeMember()
      .accounts({
        communityAccount: TokenPDA,
        memberInfo: w2PDA,
        admin: admin.publicKey,
        member: w2.publicKey,
      })
      .signers([admin])
      .rpc();
    try {
      const w2Info = await program.account.memberInfo.fetch(w2PDA);
      assert.ok(false, 'Member not removed');
    } catch (e) {
      // console.error('No member, error', e);
      assert.ok(true);
    }
  });
  it('Mint token', async () => {
    const mintAmount = new anchor.BN(1000);
    let w1Info;
    try {
      w1Info = await program.account.memberInfo.fetch(w1PDA);
    } catch (e) {
      assert.ok(false, 'Cannot get w1');
    }
    const [bagPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('Bag'),
        w1PDA.toBuffer(),
        new anchor.BN(w1Info.max).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    await program.methods
      .mintTo(mintAmount)
      .accounts({
        communityAccount: TokenPDA,
        admin: admin.publicKey,
        bag: bagPDA,
        memberInfo: w1PDA,
        member: w1.publicKey,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        phanuelProgram: program.programId,
      })
      .signers([admin])
      .rpc();
    const clockInfo = await program.provider.connection.getAccountInfo(
      anchor.web3.SYSVAR_CLOCK_PUBKEY
    );
    const clockData = CLOCK_LAYOUT.decode(clockInfo.data);
    console.log('Clock.unix_timestamp: ', clockData.unix_timestamp.toNumber());
    try {
      const bagInfo = await program.account.bag.fetch(bagPDA);
      assert.equal(bagInfo.amount.toNumber(), mintAmount.toNumber());
      console.log('decayAt: ', bagInfo.decayAt.toNumber());
      // check the decayAt is correct
      // assert.equal(bagInfo.decayAt.toNumber() - clockData.unix_timestamp.toNumber(), clockData.unix_timestamp);
    } catch (e) {
      assert.ok(false, 'Cannot mint');
    }
  });
});
