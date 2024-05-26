pub mod writer;
pub mod errors;
pub mod state;
pub mod constant;

pub mod instructions;

use anchor_lang::{prelude::*};
use instructions::*;

declare_id!("Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok");


#[program]
pub mod phanuel {
	use super::*;
	// super admin
	pub fn initialize(ctx:Context<InitAdminCtx>, close_bag_fee: u64, create_community_fee: u64) -> Result<()>{
		run_initialize(ctx, close_bag_fee, create_community_fee)
	}
	pub fn change_admin_and_fee(ctx:Context<MutAdminCtx>, new_admin: Pubkey, close_bag_fee: u64, create_community_fee: u64) -> Result<()>{
		run_change_admin_and_fee(ctx, new_admin, close_bag_fee, create_community_fee)
	}
	// create community
	pub fn create(ctx: Context<CreateCtx>, symbol: String, decay_after: u64) -> Result<()> {
		run_create(ctx, symbol, decay_after)
	}
	pub fn update(ctx: Context<UpdateCtx>, symbol: String, decay_after: u64) -> Result<()> {
		run_update(ctx, symbol, decay_after)
	}
	// manage community member
	pub fn add_member(ctx: Context<AddMemberCtx>) -> Result<()> {
		run_add_member(ctx)
	}
	pub fn remove_member(ctx: Context<CloseMemberCtx>) -> Result<()>{
		run_remove_member(ctx)
	}
	pub fn disable_member(ctx: Context<MutMemberCtx>) -> Result<()> {
		run_disable_member(ctx)
	}
	pub fn activate_member(ctx: Context<MutMemberCtx>) -> Result<()> {
		run_activate_member(ctx)
	}
	// mint
	pub fn mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
		run_mint_to(ctx, amount)
	}
	// transfer
	pub fn transfer<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, TransferCtx<'info>>, amount_each_bags: Vec<u64>) -> Result<()> {
		run_transfer(ctx, amount_each_bags)
	}
}