use anchor_lang::prelude::*;

#[error_code]
pub enum AppError {
    #[msg("Tip amount did not meet the minimum threshold.")]
    InsufficientAmount,
    #[msg("You cannot reward your own profile.")]
    SelfTippingForbidden,
    #[msg("Only the profile authority can perform this action.")]
    InvalidAccountOwner,
    #[msg("Requested amount exceeds the profile balance.")]
    BalanceTooLow,
    #[msg("Profile slot is outside the allowed range.")]
    InvalidSlot,
    #[msg("Profile name exceeds the allowed length.")]
    NameTooLong,
    #[msg("Tip message is too long.")]
    MessageTooLong,
    #[msg("Mathematical overflow detected.")]
    MathOverflow,
}
