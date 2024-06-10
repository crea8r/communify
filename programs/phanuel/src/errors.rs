use anchor_lang::{prelude::*};

#[error_code]
pub enum ErrorCode {
	#[msg("Insufficient balance")]
	pub InsufficientBalance,
	#[msg("Invalid bag owner")]
	pub InvalidBagOwner,
	#[msg("Bag decayed")]
	pub BagDecayed,
	#[msg("Bag not decayed")]
	pub BagNotDecayed,
	#[msg("Sender or Receiver disabled")]
	pub InvalidMemberStatus,
	#[msg("Exceed max token lifetime")]
	pub ExceedMaxTokenLifeTime,
	#[msg("Unauthorized")]
	pub Unauthorized,
	#[msg("Invalid number of mint")]
	pub InvalidNumberOfMint,
	#[msg("Invalid Bag PDA")]
	pub InvalidBagPDA,
	#[msg("Exceed Number of Member")]
	pub ExceedNumberOfMember,
	#[msg("Invalid Community")]
	pub InvalidCommunity,
}