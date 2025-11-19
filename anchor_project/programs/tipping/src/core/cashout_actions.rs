use anchor_lang::prelude::*;

use crate::{
    config::constants::PROFILE_SEED, errors::AppError, models::profile_account::ProfileAccount,
};

#[derive(Accounts)]
pub struct Cashout<'info> {
    #[account(
        mut,
        seeds = [
            PROFILE_SEED.as_bytes(),
            authority.key().as_ref(),
            &[profile.slot]
        ],
        bump,
        has_one = authority
    )]
    pub profile: Account<'info, ProfileAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn cashout(ctx: Context<Cashout>, amount: u64) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    let authority = &ctx.accounts.authority;

    require_keys_eq!(
        profile.authority,
        authority.key(),
        AppError::InvalidAccountOwner
    );
    require!(amount <= profile.balance, AppError::BalanceTooLow);

    **profile.to_account_info().try_borrow_mut_lamports()? -= amount;
    **authority.to_account_info().try_borrow_mut_lamports()? += amount;

    profile.balance = profile
        .balance
        .checked_sub(amount)
        .ok_or(AppError::BalanceTooLow)?;

    Ok(())
}
