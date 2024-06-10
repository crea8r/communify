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

impl CommunityAccount {
	pub const SEED: &'static [u8] = b"MINT";
}

#[account]
#[derive(InitSpace)]
// status: 0 - active, 1 - disabled (no transfer)
pub struct MemberInfo {
	pub community: Pubkey,
	pub member: Pubkey,
	pub max: u64,
	pub status: u8
}

impl MemberInfo {
	pub const SEED: &'static [u8] = b"User";
}

#[account]
#[derive(InitSpace)]
pub struct Bag {
	pub community: Pubkey,
	pub member: Pubkey,
	pub amount: u64,
	pub decay_at: u64,
	pub created_at: u64,
}

impl Bag {
	pub const SEED: &'static [u8] = b"Bag";
}

#[account]
#[derive(InitSpace)]
pub struct Memo {
	pub community: Pubkey,
	pub from: Pubkey,
	pub to: Pubkey,
	pub amount: u64,
	#[max_len(50)]
	pub note: String,
}

impl Memo {
	pub const SEED: &'static [u8] = b"Memo";
}

// need to store member telegram username and community telegram group chat
#[account]
#[derive(InitSpace)]
pub struct TelegramCommunity {
	pub community: Pubkey,
	#[max_len(50)]
	pub chat_id: i64,
}

impl TelegramCommunity {
	pub const SEED: &'static [u8] = b"Telegram";
}

#[account]
#[derive(InitSpace)]
pub struct TelegramMemberInfo {
	pub member_info: Pubkey,
	#[max_len(50)]
	pub username: String,
}

impl TelegramMemberInfo {
	pub const SEED: &'static [u8] = b"MemberTelegram";
}