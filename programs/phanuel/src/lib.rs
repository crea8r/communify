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
	pub fn mut_community_telegram(ctx:Context<MutTelegramCtx>, chat_id: i64) -> Result<()>{
		run_mut_telegram(ctx, chat_id)
	}
	// manage community member
	pub fn add_member(ctx: Context<AddMemberCtx>) -> Result<()> {
		run_add_member(ctx)
	}
	pub fn add_multiple_member<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, AddMultipleMemberCtx<'info>>, no_of_member:u8) -> Result<()>{
		run_add_multiple_member(ctx, no_of_member)
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
	pub fn mut_member_telegram(ctx: Context<MutMemberTelegramCtx>, username: String) -> Result<()> {
		run_mut_member_telegram(ctx, username)
	}
	pub fn add_multiple_member_telegram<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MutMultipleMemberTelegramCtx<'info>>, no_of_member: u8, usernames: Vec<String>) -> Result<()> {
		run_add_multiple_member_telegram(ctx, no_of_member, usernames)
	}
	pub fn edit_multiple_member_telegram<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MutMultipleMemberTelegramCtx<'info>>, no_of_member: u8, usernames: Vec<String>) -> Result<()> {
		run_edit_multiple_member_telegram(ctx, no_of_member, usernames)
	}
	// mint
	pub fn mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
		run_mint_to(ctx, amount)
	}
	pub fn multiple_mint<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MultipleMintCtx<'info>>, no_of_mint:u8, amount: u64) -> Result<()>{
		run_multiple_mint(ctx, no_of_mint, amount)
	}

	// transfer
	pub fn transfer<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, TransferCtx<'info>>, amount_each_bags: Vec<u64>, note: String) -> Result<()> {
		run_transfer(ctx, amount_each_bags, note)
	}
}