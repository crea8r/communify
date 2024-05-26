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
  const SECONDS_PER_DAY = 86400;

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
  let decay = new anchor.BN(7 * SECONDS_PER_DAY);

  it('Init admin account & change fee', async () => {
    const [adminPDAAddress] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('ADMIN')],
      program.programId
    );
    await program.methods
      .initialize(new anchor.BN(1000), new anchor.BN(10000))
      .accounts({
        authority: admin.publicKey,
        phanuelProgram: program.programId,
        adminAccount: adminPDAAddress,
      })
      .signers([admin])
      .rpc();
    let adminPDA;
    try {
      adminPDA = await program.account.adminAccount.fetch(adminPDAAddress);
      assert.equal(adminPDA.authority.toBase58(), admin.publicKey.toBase58());
      assert.equal(
        adminPDA.closeBagFee.toNumber(),
        1000,
        'close_bag_fee mismatched'
      );
      assert.equal(
        adminPDA.createCommunityFee.toNumber(),
        10000,
        'create_community_fee mismatched'
      );
    } catch (e) {
      assert.ok(false, 'Admin account not existed');
    }
  });

  it('Create token!', async () => {
    let symbol = 'TEST';
    await program.methods
      .create(symbol, decay)
      .accounts({
        communityAccount: TokenPDA,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();
    try {
      let TokenInfo = await program.account.communityAccount.fetch(TokenPDA);
      assert.equal(TokenInfo.decayAfter.toNumber(), decay.toNumber());

      const newsymbol = 'TEST2';
      const newdecay = new anchor.BN(10 * SECONDS_PER_DAY);
      await program.methods
        .update(newsymbol, newdecay)
        .accounts({
          communityAccount: TokenPDA,
          admin: admin.publicKey,
        })
        .signers([admin])
        .rpc();
      TokenInfo = await program.account.communityAccount.fetch(TokenPDA);
      assert.equal(
        TokenInfo.decayAfter.toNumber(),
        newdecay.toNumber(),
        'After update, decay time mismatched'
      );
      assert.equal(
        TokenInfo.symbol,
        newsymbol,
        'After update, symbol mismatched'
      );
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
  it('Disable & Remove member', async () => {
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
      .disableMember()
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
      assert.equal(w2Info.status, 1, 'Member is disabled, status is incorrect'); // TODO: check 1 with a static
    } catch (e) {
      // console.error('No member, error', e);
      assert.ok(false, 'w2 disappeared!');
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
    const mintAmount = new anchor.BN(700);
    let w1Info;
    let tokenInfo;
    try {
      tokenInfo = await program.account.communityAccount.fetch(TokenPDA);
    } catch (e) {
      assert.ok(false, 'Cannot get token');
    }
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
    // console.log('Clock.unix_timestamp: ', clockData.unix_timestamp.toNumber());
    try {
      const bagInfo = await program.account.bag.fetch(bagPDA);
      assert.equal(
        bagInfo.amount.toNumber(),
        mintAmount.toNumber(),
        'Minted amount mismatched'
      );
      // console.log('decayAt: ', bagInfo.decayAt.toNumber());
      // check the decayAt is correct
      assert.equal(
        bagInfo.decayAt.toNumber() - clockData.unix_timestamp.toNumber(),
        tokenInfo.decayAfter.toNumber(),
        'Decay time mismatched'
      );
    } catch (e) {
      assert.ok(false, 'Cannot mint');
    }
  });
  it('Transfer token', async () => {
    const w1Info = await program.account.memberInfo.fetch(w1PDA);
    assert.equal(w1Info.max.toNumber(), 1, 'Should have a bag here, max = 1');
    // take the previous minted bag
    let [w1bagPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('Bag'),
        w1PDA.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    // add w2
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
    // w1 send 100 token to w2
    const w2Info = await program.account.memberInfo.fetch(w2PDA);
    const toSendAmount = new anchor.BN(300);

    let [w2bagPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('Bag'),
        w2PDA.toBuffer(),
        new anchor.BN(w2Info.max).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    // substract 100 from w1bagPDA, create new w2bagPDA with 100 and a new decayAt
    await program.methods
      .transfer([new anchor.BN(toSendAmount)])
      .accounts({
        sender: w1.publicKey,
        member: w2.publicKey,
        receiverInfo: w2PDA,
        bag: w2bagPDA,
        communityAccount: TokenPDA,
        phanuelProgram: program.programId,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        senderInfo: w1PDA,
      })
      .remainingAccounts([
        {
          pubkey: w1bagPDA,
          isWritable: true,
          isSigner: false,
        },
      ])
      .signers([w1])
      .rpc();
    try {
      const w1bagInfo = await program.account.bag.fetch(w1bagPDA);
      const w2bagInfo = await program.account.bag.fetch(w2bagPDA);
      // assert.equal(w1bagInfo.amount.toNumber(), 900);
      assert.equal(w2bagInfo.amount.toNumber(), toSendAmount.toNumber());
      console.log('w1bagInfo.decayAt: ', w1bagInfo.decayAt.toNumber());
      console.log('w1bagInfo.amount: ', w1bagInfo.amount.toNumber());
      console.log('w2bagInfo.decayAt: ', w2bagInfo.decayAt.toNumber());
      console.log('w2bagInfo.amount: ', w2bagInfo.amount.toNumber());
    } catch (e) {
      assert.ok(false, 'Cannot transfer');
    }
  });
});
