use anchor_lang::{prelude::*};

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

#[account]
#[derive(InitSpace)]
pub struct Memo {
	pub community: Pubkey,
	pub from: Pubkey,
	pub to: Pubkey,
	#[max_len(50)]
	pub note: String,
}