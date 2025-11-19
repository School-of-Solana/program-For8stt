use anchor_lang::prelude::*;

pub mod config;
pub mod errors;
pub mod models;
pub mod utils;

pub mod cashout_actions {
    include!("core/cashout_actions.rs");
}
pub mod profile_actions {
    include!("core/profile_actions.rs");
}
pub mod tip_actions {
    include!("core/tip_actions.rs");
}

pub use cashout_actions::*;
pub use profile_actions::*;
pub use tip_actions::*;

declare_id!("46SS66ojgt3YBDmDPJci7tvnQLSKzXd2t5tiVmHiY3D3");

#[program]
pub mod tipping {
    use super::*;

    pub fn create_profile(ctx: Context<CreateProfile>, slot: u8, name: String) -> Result<()> {
        profile_actions::create_profile(ctx, slot, name)
    }

    pub fn give_tip(ctx: Context<GiveTip>, amount: u64, message: String) -> Result<()> {
        tip_actions::give_tip(ctx, amount, message)
    }

    pub fn cashout(ctx: Context<Cashout>, amount: u64) -> Result<()> {
        cashout_actions::cashout(ctx, amount)
    }

    pub fn close_profile(ctx: Context<CloseProfile>) -> Result<()> {
        profile_actions::close_profile(ctx)
    }
}
