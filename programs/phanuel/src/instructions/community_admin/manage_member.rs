use anchor_lang::{prelude::*};

use crate::state::*;
use crate::constant::*;
use crate::ID;

#[derive(Accounts)]
pub struct AddMemberCtx<'info> {
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(init, payer = admin, 
		seeds=[MemberInfo::SEED, community_account.key().as_ref(), member.key().as_ref()], bump,
		space = 8 + MemberInfo::INIT_SPACE,
		owner = phanuel_program.key.clone())]
	pub member_info: Account<'info, MemberInfo>,
	#[account(mut)]
	pub admin: Signer<'info>,
	/// CHECK: community member, checked in the member_info account
	pub member: AccountInfo<'info>,
	pub system_program: Program<'info, System>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}
pub fn run_add_member(ctx: Context<AddMemberCtx>) -> Result<()> {
  ctx.accounts.member_info.community = ctx.accounts.community_account.key();
  ctx.accounts.member_info.member = *ctx.accounts.member.key;
  ctx.accounts.member_info.max = 0;
  Ok(())
}

#[derive(Accounts)]
pub struct CloseMemberCtx<'info>{
	#[account(mut, close = admin, has_one = member)]
	member_info: Account<'info, MemberInfo>,
	#[account(has_one = admin)]
	community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	admin: Signer<'info>,
	/// CHECK: community member, checked in the member_info account
	member: AccountInfo<'info>,
}
pub fn run_remove_member(_ctx: Context<CloseMemberCtx>) -> Result<()> {
  // TODO: no check here can lead to error when user is added back to the community!
  Ok(())
}

#[derive(Accounts)]
pub struct MutMemberCtx<'info>{
	#[account(mut, has_one = member)]
	member_info: Account<'info, MemberInfo>,
	#[account(has_one = admin)]
	community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	admin: Signer<'info>,
	/// CHECK: community member, checked in the member_info account
	member: AccountInfo<'info>,
}
pub fn run_disable_member(ctx: Context<MutMemberCtx>) -> Result<()> {
  ctx.accounts.member_info.status = MEMBER_DISABLED;
  Ok(())
}
pub fn run_activate_member(ctx: Context<MutMemberCtx>) -> Result<()> {
  ctx.accounts.member_info.status = MEMBER_ACTIVE;
  Ok(())
}