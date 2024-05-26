use anchor_lang::{prelude::*};

use crate::state::*;
use crate::ID;

#[derive(Accounts)]
pub struct MintToCtx<'info> {
	pub system_program: Program<'info, System>,
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, 
		seeds=[b"Bag", member_info.key().as_ref(), &member_info.max.to_le_bytes()], bump, 
		space=8 + Bag::INIT_SPACE, 
		owner = phanuel_program.key.clone())]
	pub bag: Account<'info, Bag>,
	#[account(mut, has_one = member)]
	pub member_info: Account<'info, MemberInfo>,
	/// CHECK: community member, checked in the member_info and bag account
	pub member: AccountInfo<'info>,
	pub clock: Sysvar<'info, Clock>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}

pub fn run_mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
  ctx.accounts.bag.amount = amount;
  ctx.accounts.bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
  ctx.accounts.bag.member = *ctx.accounts.member.key;
  ctx.accounts.bag.community = ctx.accounts.community_account.key();

  ctx.accounts.member_info.max += 1;
  Ok(())
}