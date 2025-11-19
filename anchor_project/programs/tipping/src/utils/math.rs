use crate::config::constants::MIN_TIP_LAMPORTS;

pub fn meets_minimum_tip(amount: u64) -> bool {
    amount >= MIN_TIP_LAMPORTS
}
