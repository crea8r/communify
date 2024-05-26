use anchor_lang::{prelude::*};

use crate::errors::ErrorCode;
use crate::state::*;
use crate::constant::*;

#[derive(Accounts)]
pub struct CreateCtx<'info> {
	#[account(init, payer = admin, 
		seeds=[CommunityAccount::SEED, admin.key().as_ref()], bump,
		space = 8 + CommunityAccount::INIT_SPACE)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub system_program: Program<'info, System>,
}

pub fn run_create(ctx: Context<CreateCtx>, symbol: String, decay_after: u64) -> Result<()> {
  if decay_after > MAX_TOKEN_LIFETIME {
    return Err(ErrorCode::ExceedMaxTokenLifeTime.into());
  }
  let community_account = &mut ctx.accounts.community_account;
  community_account.symbol = symbol;
  community_account.decay_after = decay_after;
  community_account.admin = *ctx.accounts.admin.key;
  Ok(())
}

#[derive(Accounts)]
pub struct UpdateCtx<'info> {
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub system_program: Program<'info, System>,
}

pub fn run_update(ctx: Context<UpdateCtx>, symbol: String, decay_after: u64) -> Result<()> {
  if decay_after > MAX_TOKEN_LIFETIME {
    return Err(ErrorCode::ExceedMaxTokenLifeTime.into());
  }
  if ctx.accounts.community_account.admin != *ctx.accounts.admin.key {
    return Err(ErrorCode::Unauthorized.into());
  }
  let community_account = &mut ctx.accounts.community_account;
  community_account.symbol = symbol;
  community_account.decay_after = decay_after;
  community_account.admin = *ctx.accounts.admin.key;
  Ok(())
}