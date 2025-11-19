use anchor_lang::prelude::*;

use crate::{
    config::constants::{MAX_TIP_MESSAGE, PROFILE_SEED, TIP_LOG_SEED, TIP_LOG_SPACE},
    errors::AppError,
    models::{profile_account::ProfileAccount, tip_log::TipLog},
    utils::math::meets_minimum_tip,
};

#[derive(Accounts)]
pub struct GiveTip<'info> {
    #[account(
        mut,
        seeds = [
            PROFILE_SEED.as_bytes(),
            profile.authority.as_ref(),
            &[profile.slot]
        ],
        bump
    )]
    pub profile: Account<'info, ProfileAccount>,
    #[account(mut)]
    pub contributor: Signer<'info>,
    #[account(
        init,
        payer = contributor,
        space = TIP_LOG_SPACE,
        seeds = [
            TIP_LOG_SEED.as_bytes(),
            profile.key().as_ref(),
            &profile.next_comment_id.to_le_bytes()
        ],
        bump
    )]
    pub tip_log: Account<'info, TipLog>,
    pub system_program: Program<'info, System>,
}

pub fn give_tip(ctx: Context<GiveTip>, amount: u64, message: String) -> Result<()> {
    let profile = &mut ctx.accounts.profile;
    let contributor = &ctx.accounts.contributor;
    let tip_log = &mut ctx.accounts.tip_log;

    require!(meets_minimum_tip(amount), AppError::InsufficientAmount);
    require!(
        profile.authority != contributor.key(),
        AppError::SelfTippingForbidden
    );
    require!(message.len() <= MAX_TIP_MESSAGE, AppError::MessageTooLong);

    let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
        &contributor.key(),
        &profile.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &transfer_ix,
        &[contributor.to_account_info(), profile.to_account_info()],
    )?;

    profile.balance = profile
        .balance
        .checked_add(amount)
        .ok_or(AppError::MathOverflow)?;
    profile.tip_count = profile
        .tip_count
        .checked_add(1)
        .ok_or(AppError::MathOverflow)?;

    tip_log.profile = profile.key();
    tip_log.sender = contributor.key();
    tip_log.lamports = amount;
    tip_log.recorded_at = Clock::get()?.unix_timestamp;
    tip_log.message = message;

    profile.next_comment_id = profile
        .next_comment_id
        .checked_add(1)
        .ok_or(AppError::MathOverflow)?;

    Ok(())
}
