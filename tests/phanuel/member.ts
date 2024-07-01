import SDK from '../../app/sdk/src';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Phanuel } from '../../target/types/phanuel';
import loadKeypairFromFile from './lib/loadKeypairFromFile';
import { assert } from 'chai';
describe('Testing Member functions', () => {
  let community;
  const program = anchor.workspace.Phanuel as Program<Phanuel>;
  const admin = anchor.workspace.Phanuel.provider.wallet
    .payer as anchor.web3.Keypair;
  const sdk = new SDK(program.provider.connection, admin.publicKey);
  const w1 = loadKeypairFromFile('./tests/w1.json');
  const w2 = loadKeypairFromFile('./tests/w2.json');
  before(async () => {
    // create a community
    const { transaction, data } = await sdk.createCommunity({
      admin: admin.publicKey,
      tokenSymbol: 'HAPPY_COIN',
      decayDays: 7,
      renter: admin.publicKey,
    });
    await program.provider.sendAndConfirm(transaction, [admin]);
    community = data.communityAccount;
    // add member w1 & w2
    const { transaction: addMemberTxn1 } = await sdk.addMember({
      admin: admin.publicKey,
      community,
      member: w1.publicKey,
      renter: admin.publicKey,
    });
    const { transaction: addMemberTxn2 } = await sdk.addMember({
      admin: admin.publicKey,
      community,
      member: w2.publicKey,
      renter: admin.publicKey,
    });
    await program.provider.sendAndConfirm(addMemberTxn1, [admin]);
    await program.provider.sendAndConfirm(addMemberTxn2, [admin]);
    // mint to w1
    const { transaction: mintTxn } = await sdk.mintTo({
      admin: admin.publicKey,
      community,
      receiver: w1.publicKey,
      amount: 100,
      renter: admin.publicKey,
    });
    await program.provider.sendAndConfirm(mintTxn, [admin]);
  });
  it('Member can transfer token to another member', async () => {
    // transfer from w1 to w2
    const {
      transaction,
      data: { spentBags, receiverBag, memo },
    } = await sdk.transfer({
      sender: w1.publicKey,
      receiver: w2.publicKey,
      renter: w1.publicKey,
      amount: 100,
      community,
      note: 'test',
    });
    await program.provider.sendAndConfirm(transaction, [w1]);
    // check w1 balance
    const balance = await sdk.balance({
      member: w1.publicKey,
      community,
    });
    assert(balance === 0);
  });
});
