use anchor_lang::{prelude::*};
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct MutTelegramCtx<'info> {
	#[account(init_if_needed, payer = renter, 
		seeds=[TelegramCommunity::SEED, community_account.key().as_ref()], bump,
		space = 8 + TelegramCommunity::INIT_SPACE)]
	pub telegram_community: Account<'info, TelegramCommunity>,
  #[account(has_one = admin)]
  pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
  #[account(mut)]
	pub renter: Signer<'info>,
	pub system_program: Program<'info, System>,
}

pub fn run_mut_telegram(ctx: Context<MutTelegramCtx>, chat_id: i64) -> Result<()> {
  let telegram_community = &mut ctx.accounts.telegram_community;
  telegram_community.chat_id = chat_id;
  telegram_community.community = ctx.accounts.community_account.key();
  Ok(())
}

#[derive(Accounts)]
pub struct MutMemberTelegramCtx<'info> {
	#[account(init_if_needed, payer = renter, 
		seeds=[TelegramMemberInfo::SEED, member_info.key().as_ref()], bump,
		space = 8 + TelegramMemberInfo::INIT_SPACE)]
	pub telegram_member_info: Account<'info, TelegramMemberInfo>,
  pub member_info: Account<'info, MemberInfo>,
  #[account(has_one = admin)]
  pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
  #[account(mut)]
	pub renter: Signer<'info>,
	pub system_program: Program<'info, System>,
}

pub fn run_mut_member_telegram(ctx: Context<MutMemberTelegramCtx>, username: String) -> Result<()> {
  if ctx.accounts.member_info.community != ctx.accounts.community_account.key() {
    return Err(ErrorCode::InvalidCommunity.into());
  }
  let telegram_member_info = &mut ctx.accounts.telegram_member_info;
  telegram_member_info.member_info = ctx.accounts.member_info.key();
  telegram_member_info.community = ctx.accounts.community_account.key();
  telegram_member_info.username = username;
  Ok(())
}

#[derive(Accounts)]
pub struct MutMultipleMemberTelegramCtx<'info> {
  #[account(has_one = admin)]
  pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
  #[account(mut)]
	pub renter: Signer<'info>,
	pub system_program: Program<'info, System>,
}

pub fn run_add_multiple_member_telegram<'c: 'info, 'info>(_ctx: Context<'_, '_, 'c, 'info, MutMultipleMemberTelegramCtx<'info>>, _no_of_member: u8, _usernames: Vec<String>) -> Result<()> {
  // TODO: in remainingAccounts, first half is member_info, second half is the new telegram_member_info
  Ok(())
}

pub fn run_edit_multiple_member_telegram<'c: 'info, 'info>(_ctx: Context<'_, '_, 'c, 'info, MutMultipleMemberTelegramCtx<'info>>, _no_of_member: u8, _usernames: Vec<String>) -> Result<()> {
  // TODO: in remainingAccounts, first half is member_info, second half is the to-edit telegram_member_info
  Ok(())
}