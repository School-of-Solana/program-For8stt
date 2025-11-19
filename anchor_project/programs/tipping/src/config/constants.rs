pub const PROFILE_SEED: &str = "profile";
pub const TIP_LOG_SEED: &str = "tip_log";

pub const DISCRIMINATOR_LEN: usize = 8;
pub const PUBKEY_LEN: usize = 32;
pub const U64_LEN: usize = 8;
pub const I64_LEN: usize = 8;
pub const SLOT_LEN: usize = 1;
pub const STRING_PREFIX_LEN: usize = 4;

pub const MAX_PROFILE_NAME: usize = 32;
pub const MAX_TIP_MESSAGE: usize = 200;
pub const MAX_PROFILES_PER_AUTHORITY: u8 = 3;

pub const PROFILE_ACCOUNT_SPACE: usize = DISCRIMINATOR_LEN
    + U64_LEN
    + PUBKEY_LEN
    + U64_LEN
    + SLOT_LEN
    + STRING_PREFIX_LEN
    + MAX_PROFILE_NAME
    + U64_LEN
    + I64_LEN;

pub const TIP_LOG_SPACE: usize = DISCRIMINATOR_LEN
    + PUBKEY_LEN
    + PUBKEY_LEN
    + U64_LEN
    + I64_LEN
    + STRING_PREFIX_LEN
    + MAX_TIP_MESSAGE;

pub const MIN_TIP_LAMPORTS: u64 = 100_000_000; // 0.1 SOL
