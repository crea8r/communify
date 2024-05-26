use anchor_lang::{prelude::*};

use crate::errors::ErrorCode;
use crate::state::*;
use crate::writer::*;
use crate::constant::*;
use crate::ID;

pub fn run_transfer<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, TransferCtx<'info>>, amount_each_bags: Vec<u64>) -> Result<()> {
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