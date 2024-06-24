use anchor_lang::{prelude::*};

use crate::state::*;
use crate::constant::*;
use crate::ID;
use crate::errors::ErrorCode;
use crate::writer::*;

#[derive(Accounts)]
pub struct AddMemberCtx<'info> {
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(init, payer = renter, 
		seeds=[MemberInfo::SEED, community_account.key().as_ref(), member.key().as_ref()], bump,
		space = 8 + MemberInfo::INIT_SPACE,
		owner = phanuel_program.key.clone())]
	pub member_info: Account<'info, MemberInfo>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(mut)]
	pub renter: Signer<'info>,
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

#[derive(Accounts)]
pub struct AddMultipleMemberCtx<'info> {
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	#[account(mut)]
	pub renter: Signer<'info>,
	pub system_program: Program<'info, System>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
}
pub fn run_add_multiple_member<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, AddMultipleMemberCtx<'info>>, no_of_member: u8) -> Result<()> {
	if no_of_member == 0 || no_of_member > MAX_NO_OF_MEMBER{
		return Err(ErrorCode::ExceedNumberOfMember.into());
	}
	let remaining_iter = &mut ctx.remaining_accounts.iter();
	// (first half) member and (second half) member_info account in remaining accounts
	let mut member_idx = 0;
	// create an array of Pubkey with the size of no_of_member
	let mut members: Vec<Pubkey> = Vec::with_capacity(no_of_member as usize);
  for (idx, account_info) in remaining_iter.enumerate() {
		if idx < no_of_member as usize {
			members.push(*account_info.key);
		}else{
			// member_info is not existed, create a new member_info
			let binding_community = ctx.accounts.community_account.key();
			let binding_member = members.get(member_idx).unwrap();
			// last bag: member_info.max - 1!
			let seeds: &[&[u8]] = &[MemberInfo::SEED, binding_community.as_ref(), binding_member.as_ref()];
			let (member_info_pda, bump) = Pubkey::find_program_address(
				seeds, ctx.accounts.phanuel_program.key
			);
			if member_info_pda != *account_info.key {
				return Err(ErrorCode::InvalidBagPDA.into());
			}
			create_account(ctx.accounts.system_program.to_account_info(), 
				ctx.accounts.renter.to_account_info(), 
				account_info.to_account_info(), 
				seeds, bump, 
				8 + MemberInfo::INIT_SPACE, ctx.accounts.phanuel_program.key)?;
			
			let mut member_info: Account<MemberInfo> = Account::try_from_unchecked(account_info).unwrap();
			
			member_info.community = binding_community;
			member_info.member = *binding_member;
			member_info.max = 0;
			member_info.status = MEMBER_ACTIVE;

			let x = member_info.to_account_info();
			let dst: &mut [u8] = &mut x.try_borrow_mut_data().unwrap();
			let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
			MemberInfo::try_serialize(&member_info, &mut writer)?;
			member_idx += 1;
		}
	}
	Ok(())
}