use anchor_lang::prelude::*;

#[account]
pub struct ProfileAccount {
    pub tip_count: u64,
    pub authority: Pubkey,
    pub balance: u64,
    pub slot: u8,
    pub name: String,
    pub next_comment_id: u64,
    pub created_at: i64,
}
