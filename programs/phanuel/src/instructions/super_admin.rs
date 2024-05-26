use anchor_lang::{prelude::*};
use crate::ID;
use crate::state::AdminAccount;

pub fn run_initialize(ctx:Context<InitAdminCtx>, close_bag_fee: u64, create_community_fee: u64) -> Result<()>{
  ctx.accounts.admin_account.close_bag_fee = close_bag_fee;
  ctx.accounts.admin_account.create_community_fee = create_community_fee;
  ctx.accounts.admin_account.authority = *ctx.accounts.authority.key;
  Ok(())
}

pub fn run_change_admin_and_fee(ctx:Context<MutAdminCtx>, new_admin: Pubkey, close_bag_fee: u64, create_community_fee: u64)-> Result<()>{
  ctx.accounts.admin_account.close_bag_fee = close_bag_fee;
  ctx.accounts.admin_account.create_community_fee = create_community_fee;
  ctx.accounts.admin_account.authority = new_admin;
  Ok(())
}

#[derive(Accounts)]
pub struct InitAdminCtx<'info>{
	#[account(init, payer=authority, seeds=[b"ADMIN"], bump, 
		space=8 + AdminAccount::INIT_SPACE)]
	pub admin_account: Account<'info, AdminAccount>,
	#[account(mut)]
	pub authority: Signer<'info>,
	pub system_program: Program<'info, System>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct MutAdminCtx<'info> {
	// CHECK condition
	#[account(mut, has_one = authority)]
	pub admin_account: Account<'info, AdminAccount>,
	#[account(mut)]
	pub authority: Signer<'info>,
	pub system_program: Program<'info, System>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}