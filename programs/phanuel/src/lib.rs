use anchor_lang::{prelude::*};

declare_id!("Pha5A3BB4xKRZDs8ycvukFUagaKvk3AQBaH3J5qwAok");

#[program]
pub mod phanuel {
	use super::*;
	
	pub fn create(ctx: Context<CreateCtx>, symbol: [u8; 3], decay_after: u64) -> Result<()> {
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

	pub fn mint_to(ctx: Context<MintToCtx>, amount: u64) -> Result<()> {
		ctx.accounts.bag.amount = amount;
		ctx.accounts.bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
		ctx.accounts.bag.member = *ctx.accounts.member.key;
		ctx.accounts.bag.community = ctx.accounts.community_account.key();

		ctx.accounts.member_info.max += 1;
		Ok(())
	}

	pub fn transfer<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, TransferCtx<'info>>, amount_each_bags: Vec<u64>) -> Result<()> {
		// bags in the remaining_accounts
		let bags_iter = &mut ctx.remaining_accounts.iter();
		let mut total = 0;
		for amount in amount_each_bags {
			let mut bag:Account<Bag> = Account::try_from(next_account_info(bags_iter)?).unwrap();
			if bag.member != *ctx.accounts.member.key {
				return Err(ErrorCode::InvalidBagOwner.into());
			}
			if bag.amount < amount {
				return Err(ErrorCode::InsufficientBalance.into());
			}
			if bag.decay_at < ctx.accounts.clock.unix_timestamp as u64 {
				return Err(ErrorCode::BagDecayed.into());
			}
			bag.amount -= amount;
			total += amount;
		}
		// now create a bag for the receiver
		ctx.accounts.bag.amount = total;
		ctx.accounts.bag.decay_at = ctx.accounts.clock.unix_timestamp as u64 + ctx.accounts.community_account.decay_after;
		ctx.accounts.bag.member = *ctx.accounts.member.key;
		ctx.accounts.bag.community = ctx.accounts.community_account.key();

		ctx.accounts.receiver_info.max += 1;
		Ok(())
	}

	// Member can clean decayed bags
	pub fn close_bag(ctx: Context<CloseBagCtx>, forced: bool) -> Result<()>{
		if !forced && (ctx.accounts.clock.unix_timestamp as u64) > ctx.accounts.account.decay_at {
			 return Err(ErrorCode::BagNotDecayed.into());
		}
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
}

#[derive(Accounts)]
pub struct CreateCtx<'info> {
	#[account(init, payer = admin, space = 8 + CommunityAccount::INIT_SPACE)]
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
		space=8 + Bag::INIT_SPACE, has_one = member, owner = phanuel_program.key.clone())]
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
		has_one = member, owner = phanuel_program.key.clone())]
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
	#[account(mut, close = admin)]
	account: Account<'info, MemberInfo>,
	#[account(has_one = admin)]
	community_account: Account<'info, CommunityAccount>,
	#[account(mut)]
	admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferCtx<'info> {
	#[account(mut)]
	pub sender: Signer<'info>,
	/// CHECK: already check on bag
	pub member: AccountInfo<'info>, // receiver
	#[account(mut, has_one = member)]
	pub receiver_info: Account<'info, MemberInfo>,
	#[account(init, payer = sender, 
		seeds=[b"Bag", receiver_info.key().as_ref(), &receiver_info.max.to_le_bytes()], bump, 
		space=8 + Bag::INIT_SPACE, has_one = member, owner = phanuel_program.key.clone())]
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

#[account]
#[derive(InitSpace)]
pub struct CommunityAccount {
	pub symbol: [u8; 3],
	pub decay_after: u64,
	pub admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct MemberInfo {
	pub community: Pubkey,
	pub member: Pubkey,
	pub max: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Bag {
	pub community: Pubkey,
	pub member: Pubkey,
	pub amount: u64,
	pub decay_at: u64,
}
