use anchor_lang::prelude::*;

pub fn slot_seed(slot: u8) -> [u8; 1] {
    [slot]
}

pub fn tip_index_seed(index: u64) -> [u8; 8] {
    index.to_le_bytes()
}

pub fn is_comment_for_profile(account: &AccountInfo, profile_key: &Pubkey) -> Result<bool> {
    let mut data: &[u8] = &account.try_borrow_data()?;
    if data.is_empty() {
        return Ok(false);
    }

    if let Ok(state) = crate::models::tip_log::TipLog::try_deserialize(&mut data) {
        Ok(state.profile == *profile_key)
    } else {
        Ok(false)
    }
}
