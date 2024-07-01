import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Phanuel } from '../../target/types/phanuel';
import { assert } from 'chai';
import SDK from '../../app/sdk/src';
import loadKeypairFromFile from './lib/loadKeypairFromFile';

describe('Testing Admin functions', () => {
  const program = anchor.workspace.Phanuel as Program<Phanuel>;
  const admin = anchor.workspace.Phanuel.provider.wallet
    .payer as anchor.web3.Keypair;
  const sdk = new SDK(program.provider.connection, admin.publicKey);
  const w1 = loadKeypairFromFile('./tests/w1.json');
  const w2 = loadKeypairFromFile('./tests/w2.json');
  it('Create token', async () => {
    const SECONDS_PER_DAY = 86400;
    const decayDays = 7;
    const tokenSymbol = 'CRAZY_COIN';
    const { transaction, data } = await sdk.createCommunity({
      admin: admin.publicKey,
      tokenSymbol,
      decayDays,
      renter: admin.publicKey,
    });
    await program.provider.sendAndConfirm(transaction, [admin]);
    let TokenInfo = await program.account.communityAccount.fetch(
      data.communityAccount
    );
    assert.equal(
      TokenInfo.decayAfter.toNumber(),
      decayDays * SECONDS_PER_DAY,
      'Error in creating token'
    );
    assert.equal(TokenInfo.symbol, tokenSymbol, 'Error in creating token');
    const newSymbol = 'NEW_CRAZY_COIN';
    const newDecayDays = 20;
    const { transaction: updateTxn, data: updateData } =
      await sdk.updateCommunity({
        admin: admin.publicKey,
        community: data.communityAccount,
        tokenSymbol: newSymbol,
        decayDays: newDecayDays,
      });
    await program.provider.sendAndConfirm(updateTxn, [admin]);
    TokenInfo = await program.account.communityAccount.fetch(
      data.communityAccount
    );
    assert.equal(
      TokenInfo.decayAfter.toNumber(),
      newDecayDays * SECONDS_PER_DAY,
      'Error in editing token'
    );
    assert.equal(TokenInfo.symbol, newSymbol, 'Error in editing token');
  });
  describe('Managing members in a community', () => {
    let community;
    before(async () => {
      const { transaction, data } = await sdk.createCommunity({
        admin: admin.publicKey,
        tokenSymbol: 'HAPPY_COIN',
        decayDays: 7,
        renter: admin.publicKey,
      });
      await program.provider.sendAndConfirm(transaction, [admin]);
      community = data.communityAccount;
    });
    it('Add member!', async () => {
      const { transaction: addMemberTxn, data: addMemberData } =
        await sdk.addMember({
          admin: admin.publicKey,
          community,
          member: w1.publicKey,
          renter: admin.publicKey,
        });
      const w1PDA = addMemberData.memberInfo;
      await program.provider.sendAndConfirm(addMemberTxn, [admin]);
      try {
        const w1Info = await program.account.memberInfo.fetch(w1PDA);
        assert.equal(w1Info.member.toBase58(), w1.publicKey.toBase58());
        assert.equal(w1Info.max.toNumber(), 0);
        assert.equal(w1Info.community.toBase58(), community.toBase58());
      } catch (e) {
        console.error('No member, error', e);
        assert.ok(false);
      }
    });
    it('Disable member', async () => {
      const { transaction: addMemberTxn, data: addMemberData } =
        await sdk.addMember({
          admin: admin.publicKey,
          community,
          member: w2.publicKey,
          renter: admin.publicKey,
        });
      const w2PDA = addMemberData.memberInfo;
      await program.provider.sendAndConfirm(addMemberTxn, [admin]);
      const { transaction: txnDisable } = await sdk.disableMember({
        admin: admin.publicKey,
        community,
        memberInfo: w2PDA,
      });
      await program.provider.sendAndConfirm(txnDisable, [admin]);
      try {
        const w1Info = await program.account.memberInfo.fetch(w2PDA);
        assert.equal(
          w1Info.status,
          1,
          'Member is disabled, status is incorrect'
        ); // TODO: check 1 with a static
      } catch (e) {
        // console.error('No member, error', e);
        assert.ok(false, 'w2 disappeared!');
      }
    });
    it('Mint token', async () => {
      const {
        transaction,
        data: { memberInfoAccount, bagAccount },
      } = await sdk.mintTo({
        admin: admin.publicKey,
        receiver: w1.publicKey,
        amount: 1000,
        community,
        renter: admin.publicKey,
      });
      await program.provider.sendAndConfirm(transaction, [admin]);
      try {
        const bagInfo = await program.account.bag.fetch(bagAccount);
        assert.equal(bagInfo.amount.toNumber(), 1000);
      } catch (e) {
        console.error('Token not minted, error', e);
        assert.ok(false);
      }
    });
  });
  require('./admin.telegram.ts');
});
