use anchor_lang::prelude::*;

use crate::{
    config::constants::{
        MAX_PROFILES_PER_AUTHORITY, MAX_PROFILE_NAME, PROFILE_ACCOUNT_SPACE, PROFILE_SEED,
    },
    errors::AppError,
    models::profile_account::ProfileAccount,
    utils::pda::is_comment_for_profile,
};

#[derive(Accounts)]
#[instruction(slot: u8, name: String)]
pub struct CreateProfile<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = PROFILE_ACCOUNT_SPACE,
        seeds = [PROFILE_SEED.as_bytes(), authority.key().as_ref(), &[slot]],
        bump
    )]
    pub profile: Account<'info, ProfileAccount>,
    pub system_program: Program<'info, System>,
}

pub fn create_profile(ctx: Context<CreateProfile>, slot: u8, name: String) -> Result<()> {
    require!(slot < MAX_PROFILES_PER_AUTHORITY, AppError::InvalidSlot);
    require!(name.len() <= MAX_PROFILE_NAME, AppError::NameTooLong);

    let profile = &mut ctx.accounts.profile;
    profile.tip_count = 0;
    profile.authority = ctx.accounts.authority.key();
    profile.balance = 0;
    profile.slot = slot;
    profile.name = name;
    profile.next_comment_id = 0;
    profile.created_at = Clock::get()?.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
pub struct CloseProfile<'info> {
    #[account(
        mut,
        seeds = [
            PROFILE_SEED.as_bytes(),
            authority.key().as_ref(),
            &[profile.slot]
        ],
        bump,
        has_one = authority,
        close = authority
    )]
    pub profile: Account<'info, ProfileAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn close_profile(ctx: Context<CloseProfile>) -> Result<()> {
    let authority_info = ctx.accounts.authority.to_account_info();
    let profile_key = ctx.accounts.profile.key();
    let program_id = ctx.program_id;

    require_keys_eq!(
        ctx.accounts.profile.authority,
        ctx.accounts.authority.key(),
        AppError::InvalidAccountOwner
    );

    for account in ctx.remaining_accounts.iter() {
        if account.owner != program_id {
            continue;
        }

        if account.key() == profile_key {
            continue;
        }

        if !is_comment_for_profile(account, &profile_key)? {
            continue;
        }

        let lamports = **account.lamports.borrow();
        **authority_info.lamports.borrow_mut() += lamports;
        **account.lamports.borrow_mut() = 0;
        let mut data = account.try_borrow_mut_data()?;
        data.fill(0);
    }

    Ok(())
}
