use anchor_lang::prelude::*;

#[account]
pub struct TipLog {
    pub profile: Pubkey,
    pub sender: Pubkey,
    pub lamports: u64,
    pub recorded_at: i64,
    pub message: String,
}
