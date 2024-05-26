pub static MEMBER_ACTIVE:u8 = 0;
pub static MEMBER_DISABLED:u8 = 1;
// TODO: use 'authority' keyword for consistency
pub static SECONDS_PER_DAY:u64 = 24 * 60 * 60;
// in days
pub static MAX_TOKEN_LIFETIME:u64 = 365 * SECONDS_PER_DAY;
pub static MAX_NO_OF_MINT:u8 = 100;