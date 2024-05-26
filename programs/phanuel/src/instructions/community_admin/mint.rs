use anchor_lang::{prelude::*};

use crate::constant::MAX_NO_OF_MINT;
use crate::state::*;
use crate::ID;
use crate::errors::ErrorCode;
use crate::writer::*;

#[derive(Accounts)]
pub struct MintToCtx<'info> {
	pub system_program: Program<'info, System>,
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(init, payer = admin, 
		seeds=[Bag::SEED, member_info.key().as_ref(), &member_info.max.to_le_bytes()], bump, 
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

#[derive(Accounts)]
pub struct MultipleMintCtx<'info> {
	pub system_program: Program<'info, System>,
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub clock: Sysvar<'info, Clock>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}

pub fn run_multiple_mint<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, MultipleMintCtx<'info>>, no_of_mint: u8, amount: u64) -> Result<()> {
	if no_of_mint == 0 || no_of_mint > MAX_NO_OF_MINT{
		return Err(ErrorCode::InvalidNumberOfMint.into());
	}
	let remaining_iter = &mut ctx.remaining_accounts.iter();
	// (first half) member_info and (second half) bag account in remaining accounts
	let mut member_idx = 0;
	// create an array of Pubkey with the size of no_of_mint
	let mut member_info_accounts: Vec<Account<MemberInfo>> = Vec::with_capacity(no_of_mint as usize);
  for (idx, account_info) in remaining_iter.enumerate() {
		if idx < no_of_mint as usize {
			// account_info is an existed member_info account
			let mut member_info: Account<MemberInfo> = Account::try_from_unchecked(account_info).unwrap();
			member_info.max = member_info.max + 1;
			let x = member_info.to_account_info();
			let dst: &mut [u8] = &mut x.try_borrow_mut_data().unwrap();
			let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
			MemberInfo::try_serialize(&member_info, &mut writer)?;
			member_info_accounts.push(member_info.clone());
		}else{
			// account_info is a bag account
			// bag is not existed, create a new bag account
			//Bag::SEED, member_info.key().as_ref(), &member_info.max.to_le_bytes()
			let member_info = &member_info_accounts[member_idx];
			let binding = member_info.key();
			// last bag: member_info.max - 1!
			let seeds: &[&[u8]] = &[Bag::SEED, binding.as_ref(), &(member_info.max-1).to_le_bytes()];
			let (bag_pda, bump) = Pubkey::find_program_address(
				seeds, ctx.accounts.phanuel_program.key
			);
			if bag_pda != *account_info.key {
				return Err(ErrorCode::InvalidBagPDA.into());
			}
			create_account(ctx.accounts.system_program.to_account_info(), 
				ctx.accounts.admin.to_account_info(), 
				account_info.to_account_info(), 
				seeds, bump, 
				8 + Bag::INIT_SPACE, ctx.accounts.phanuel_program.key)?;
			
			let mut bag: Account<Bag> = Account::try_from_unchecked(account_info).unwrap();
			
			bag.amount = amount;
			bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
			bag.member = member_info.member.key().clone();
			bag.community = ctx.accounts.community_account.key().clone();

			let x = bag.to_account_info();
			let dst: &mut [u8] = &mut x.try_borrow_mut_data().unwrap();
			let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
			Bag::try_serialize(&bag, &mut writer)?;
			member_idx += 1;
		}
	}
	Ok(())
}