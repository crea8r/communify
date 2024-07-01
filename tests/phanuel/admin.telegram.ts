import { assert } from 'chai';
import SDK from '../../app/sdk/src';
import { Program } from '@coral-xyz/anchor';
import { Phanuel } from '../../target/types/phanuel';
import * as anchor from '@coral-xyz/anchor';
import loadKeypairFromFile from './lib/loadKeypairFromFile';
describe('Testing Admin x Telegram function', () => {
  const program = anchor.workspace.Phanuel as Program<Phanuel>;
  const admin = anchor.workspace.Phanuel.provider.wallet
    .payer as anchor.web3.Keypair;
  const sdk = new SDK(program.provider.connection, admin.publicKey);
  const w1 = loadKeypairFromFile('./tests/w1.json');
  let community, TokenPDA;
  before(async () => {
    const { transaction, data } = await sdk.createCommunity({
      admin: admin.publicKey,
      tokenSymbol: 'HAPPY_COIN',
      decayDays: 7,
      renter: admin.publicKey,
    });
    TokenPDA = data.communityAccount;
    await program.provider.sendAndConfirm(transaction, [admin]);
    community = data.communityAccount;
  });
  it('Link token to telegram chatId', async () => {
    const chatId = '-1002002393144';
    const { transaction: upsertTelegramTxn, data: upserTelegramData } =
      await sdk.upsertCommunityTelegram({
        admin: admin.publicKey,
        chatId,
        community,
        renter: admin.publicKey,
      });
    await program.provider.sendAndConfirm(upsertTelegramTxn, [admin]);
    const telegramPDA = upserTelegramData.telegramCommunity;
    try {
      const telegramInfo = await program.account.telegramCommunity.fetch(
        telegramPDA
      );
      assert.equal(telegramInfo.chatId.toString(), chatId);
      assert.equal(telegramInfo.community.toBase58(), TokenPDA.toBase58());
    } catch (e) {
      console.error('Telegram not linked, error', e);
      assert.ok(false);
    }
    const newChatId = '-1002085007814';
    const { transaction: upsertTelegramTxn1 } =
      await sdk.upsertCommunityTelegram({
        admin: admin.publicKey,
        chatId: newChatId,
        community,
        renter: admin.publicKey,
      });
    await program.provider.sendAndConfirm(upsertTelegramTxn1, [admin]);
    try {
      const telegramInfo = await program.account.telegramCommunity.fetch(
        telegramPDA
      );
      assert.equal(telegramInfo.chatId.toString(), newChatId);
      assert.equal(telegramInfo.community.toBase58(), TokenPDA.toBase58());
    } catch (e) {
      console.error('Telegram not changed, error', e);
      assert.ok(false);
    }
  });
  it('Upsert member w1 Telegram', async () => {
    const { transaction: addMemberTxn, data: addMemberData } =
      await sdk.addMember({
        admin: admin.publicKey,
        community,
        member: w1.publicKey,
        renter: admin.publicKey,
      });
    const w1PDA = addMemberData.memberInfo;
    await program.provider.sendAndConfirm(addMemberTxn, [admin]);

    const username = 'hieubt88';
    const {
      transaction: txnChangeMemebersTelegram,
      data: { telegramMemberInfos },
    } = await sdk.changeMembersTelegram({
      memberInfos: [w1PDA],
      admin: admin.publicKey,
      usernames: [username],
      renter: admin.publicKey,
      community,
    });
    await program.provider.sendAndConfirm(txnChangeMemebersTelegram, [admin]);
    try {
      const telegramInfo = await program.account.telegramMemberInfo.fetch(
        telegramMemberInfos[0]
      );
      assert.equal(telegramInfo.username, username);
      assert.equal(telegramInfo.memberInfo.toBase58(), w1PDA.toBase58());
    } catch (e) {
      console.error('Member Telegram not linked, error', e);
      assert.ok(false);
    }
    const newUsername = 'newUserName';
    const { transaction: newTxnChangeMemebersTelegram } =
      await sdk.changeMembersTelegram({
        memberInfos: [w1PDA],
        admin: admin.publicKey,
        usernames: [newUsername],
        renter: admin.publicKey,
        community,
      });
    await program.provider.sendAndConfirm(newTxnChangeMemebersTelegram, [
      admin,
    ]);
    try {
      const telegramInfo = await program.account.telegramMemberInfo.fetch(
        telegramMemberInfos[0]
      );
      assert.equal(telegramInfo.username, newUsername);
      assert.equal(telegramInfo.memberInfo.toBase58(), w1PDA.toBase58());
    } catch (e) {
      console.error('Member Telegram not changed, error', e);
      assert.ok(false);
    }
  });
});
