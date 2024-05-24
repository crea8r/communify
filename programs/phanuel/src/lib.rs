use anchor_lang::{prelude::*};
pub mod writer;
use writer::BpfWriter;

declare_id!("Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok");

static MEMBER_ACTIVE:u8 = 0;
static MEMBER_DISABLED:u8 = 1;
// TODO: use 'authority' keyword for consistency
#[program]
pub mod phanuel {
	use super::*;
	
	pub fn create(ctx: Context<CreateCtx>, symbol: String, decay_after: u64) -> Result<()> {
		let community_account = &mut ctx.accounts.community_account;
		community_account.symbol = symbol;
		community_account.decay_after = decay_after;
		community_account.admin = *ctx.accounts.admin.key;
		Ok(())
	}

	pub fn add_member(ctx: Context<AddMemberCtx>) -> Result<()> {
		ctx.accounts.member_info.community = ctx.accounts.community_account.key();
		ctx.accounts.member_info.member = *ctx.accounts.member.key;
		ctx.accounts.member_info.max = 0;
		Ok(())
	}

	pub fn remove_member(_ctx: Context<CloseMemberCtx>) -> Result<()> {
		// TODO: no check here can lead to error when user is added back to the community!
		Ok(())
	}

	pub fn disable_member(ctx: Context<MutMemberCtx>) -> Result<()> {
		ctx.accounts.member_info.status = MEMBER_DISABLED;
		Ok(())
	}

	pub fn activate_member(ctx: Context<MutMemberCtx>) -> Result<()> {
		ctx.accounts.member_info.status = MEMBER_ACTIVE;
		Ok(())
	}

	pub fn mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
		ctx.accounts.bag.amount = amount;
		ctx.accounts.bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
		ctx.accounts.bag.member = *ctx.accounts.member.key;
		ctx.accounts.bag.community = ctx.accounts.community_account.key();

		ctx.accounts.member_info.max += 1;
		Ok(())
	}

	pub fn transfer<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, TransferCtx<'info>>, amount_each_bags: Vec<u64>) -> Result<()> {
		if ctx.accounts.sender_info.member != *ctx.accounts.sender.key {
			return Err(ErrorCode::InvalidBagOwner.into());
		}
		if ctx.accounts.sender_info.status == MEMBER_DISABLED || ctx.accounts.receiver_info.status == MEMBER_DISABLED{
			return Err(ErrorCode::InvalidMemberStatus.into());
		}
		// bags in the remaining_accounts
		let bags_iter = &mut ctx.remaining_accounts.iter();
		let mut amount_each_bags = amount_each_bags.iter();
		let mut total: u64 = 0;
		for account_info in bags_iter {
			let mut bag: Account<Bag> = Account::try_from_unchecked(account_info).unwrap();
			let amount = *amount_each_bags.next().unwrap();
			if bag.member != *ctx.accounts.sender.key {
				return Err(ErrorCode::InvalidBagOwner.into());
			}
			if bag.amount < amount {
				return Err(ErrorCode::InsufficientBalance.into());
			}
			if bag.decay_at < ctx.accounts.clock.unix_timestamp as u64 {
				return Err(ErrorCode::BagDecayed.into());
			}
			bag.amount = bag.amount - amount;
			let x = bag.to_account_info();
			let dst: &mut [u8] = &mut x.try_borrow_mut_data().unwrap();
			let mut writer: BpfWriter<&mut [u8]> = BpfWriter::new(dst);
			Bag::try_serialize(&bag, &mut writer)?;
			total += amount;
		}
		// // now create a bag for the receiver
		ctx.accounts.bag.amount = total;
		ctx.accounts.bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
		ctx.accounts.bag.member = *ctx.accounts.member.key;
		ctx.accounts.bag.community = ctx.accounts.community_account.key();

		ctx.accounts.receiver_info.max += 1;
		Ok(())
	}

	// Member can clean decayed bags
	pub fn close_bag(ctx: Context<CloseBagCtx>, forced: bool) -> Result<()>{
		// TODO: transfer fee to AdminAccount
		if !forced && (ctx.accounts.clock.unix_timestamp as u64) > ctx.accounts.account.decay_at {
			 return Err(ErrorCode::BagNotDecayed.into());
		}
		Ok(())
	}

	pub fn initialize(ctx:Context<InitAdminCtx>, close_bag_fee: u64, create_community_fee: u64) -> Result<()>{
		ctx.accounts.admin_account.close_bag_fee = close_bag_fee;
		ctx.accounts.admin_account.create_community_fee = create_community_fee;
		ctx.accounts.admin_account.authority = *ctx.accounts.authority.key;
		Ok(())
	}

	pub fn change_admin_and_fee(ctx:Context<MutAdminCtx>, new_admin: Pubkey, close_bag_fee: u64, create_community_fee: u64)-> Result<()>{
		ctx.accounts.admin_account.close_bag_fee = close_bag_fee;
		ctx.accounts.admin_account.create_community_fee = create_community_fee;
		ctx.accounts.admin_account.authority = new_admin;
		Ok(())
	}
}

#[error_code]
pub enum ErrorCode {
	#[msg("Insufficient balance")]
	InsufficientBalance,
	#[msg("Invalid bag owner")]
	InvalidBagOwner,
	#[msg("Bag decayed")]
	BagDecayed,
	#[msg("Bag not decayed")]
	BagNotDecayed,
	#[msg("Sender or Receiver disabled")]
	InvalidMemberStatus,
}

#[derive(Accounts)]
pub struct CreateCtx<'info> {
	#[account(init, payer = admin, 
		seeds=[b"MINT", admin.key().as_ref()], bump,
		space = 8 + CommunityAccount::INIT_SPACE)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	pub admin: Signer<'info>,
	pub system_program: Program<'info, System>,
}

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

#[derive(Accounts)]
pub struct AddMemberCtx<'info> {
	#[account(mut, has_one = admin)]
	pub community_account: Account<'info, CommunityAccount>,
	#[account(init, payer = admin, 
		seeds=[b"User", community_account.key().as_ref(), member.key().as_ref()], bump,
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

#[derive(Accounts)]
pub struct TransferCtx<'info> {
	#[account(mut)]
	pub sender: Signer<'info>,
	/// CHECK: already check on bag
	pub member: AccountInfo<'info>, // receiver
	#[account(mut, has_one = member)]
	pub receiver_info: Account<'info, MemberInfo>,
	#[account(mut)]
	pub sender_info: Account<'info, MemberInfo>,
	#[account(init, payer = sender, 
		seeds=[b"Bag", receiver_info.key().as_ref(), &receiver_info.max.to_le_bytes()], bump, 
		space=8 + Bag::INIT_SPACE, owner = phanuel_program.key.clone())]
	pub bag: Account<'info, Bag>,
	pub community_account: Account<'info, CommunityAccount>,
	pub system_program: Program<'info, System>,
	#[account(address = ID)]
	/// CHECK: phanuel program
	pub phanuel_program: AccountInfo<'info>,
	pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct CloseBagCtx<'info>{
	#[account(mut, close = member, has_one = member)]
	account: Account<'info, Bag>,
	#[account(mut)]
	member: Signer<'info>,
	pub clock: Sysvar<'info, Clock>,
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

#[account]
#[derive(InitSpace)]
pub struct AdminAccount {
	// also the fee receiver
	pub authority: Pubkey,
	// fee in lamport
	pub close_bag_fee: u64,
	pub create_community_fee: u64,
}

#[account]
#[derive(InitSpace)]
pub struct CommunityAccount {
	pub decay_after: u64,
	pub admin: Pubkey,
	#[max_len(100)]
	pub symbol: String,
}

#[account]
#[derive(InitSpace)]
// status: 0 - active, 1 - disabled (no transfer)
pub struct MemberInfo {
	pub community: Pubkey,
	pub member: Pubkey,
	pub max: u64,
	pub status: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bag {
	pub community: Pubkey,
	pub member: Pubkey,
	pub amount: u64,
	pub decay_at: u64,
}
