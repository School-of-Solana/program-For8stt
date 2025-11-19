# Project Description

**Deployed Frontend URL:**  https://sol-bee-hive-dapp.vercel.app/beeHive/accounts

**Solana Program ID (Devnet):** 46SS66ojgt3YBDmDPJci7tvnQLSKzXd2t5tiVmHiY3D3  

**Latest Deploy Signature:** 2D51cFjhHmqbnx8oSSAQmke33XZ96Geqp7kyqo3rhF1uKPihKhJ4rgpsiLV6eXup9KE3VzfbdTAvBQwkUnSpbokj (devnet)


---

## Project Overview

### Description
BeeHive is a Solana-based tipping hub for creators. Every wallet can spawn up to three BeeHive profile vaults (PDAs) that accept SOL tips along with supporter messages. The program tracks each profile’s balance, total tips, number of contributions, and creation timestamp. Tip entries (`TipLog`) keep the sender, lamports, message, and on-chain timestamp so creators have a transparent and immutable history.

### Key Features
- **Create BeeHive Profile** – choose a slot (0–2) and initialize a PDA (`ProfileAccount`)
- **Send Tips with Messages** – supporters send ≥0.1 SOL plus an optional note, automatically logged on-chain
- **Self-Tip Protection** – authorities cannot tip their own profile
- **Cash Out / Close** – owners withdraw accumulated SOL or close the profile and sweep the associated `TipLog` PDAs
- **Analytics Dashboard** – frontend displays balances, tip counts, tip history, and authority insights

### How to Use the dApp
1. **Connect Wallet** – choose Devnet in the cluster dropdown if testing on devnet  
2. **Create Profile** – pick a slot and enter a name (max 32 chars)  
3. **Share Your BeeHive PDA** – supporters can see the listing and tip with a message  
4. **Cash Out** – withdraw partial funds to your wallet at any time  
5. **Close Profile** – when done, close the slot to free it for a future campaign

---

## Program Architecture

The Anchor program lives in `anchor_project/programs/tipping`. Logic is organized into:
- `core/` – instruction handlers (`profile_actions.rs`, `tip_actions.rs`, `cashout_actions.rs`)
- `models/` – account structs (`ProfileAccount`, `TipLog`)
- `utils/` – PDA helpers and math guards
- `config/` – constants (seeds, account sizing, minimum tip)

### PDA Usage
| PDA | Seeds | Purpose |
|-----|-------|---------|
| **ProfileAccount** | `["profile", authority, slot]` | Main vault for a creator profile (authority, balance, counts, timestamps, name) |
| **TipLog** | `["tip_log", profile, comment_id]` | Stores each tip’s sender, lamports, message, `recorded_at` |

### Program Instructions
| Instruction | Description |
|-------------|-------------|
| `create_profile(slot, name)` | Initializes a `ProfileAccount` PDA; validates slot limit (≤3) and name length, sets `created_at`. |
| `give_tip(amount, message)` | Enforces ≥0.1 SOL, prevents self tipping, transfers lamports, increments `balance` + `tip_count`, writes `TipLog`. |
| `cashout(amount)` | Authority-only withdraw; ensures `amount <= balance`, updates `balance`. |
| `close_profile()` | Authority closes profile and optional `TipLog` PDAs passed via remaining accounts; lamports swept back to authority. |

### Account Structures
```rust
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

#[account]
pub struct TipLog {
    pub profile: Pubkey,
    pub sender: Pubkey,
    pub lamports: u64,
    pub recorded_at: i64,
    pub message: String,
}
```

---

## Testing

### Test Coverage
(File: `anchor_project/tests/beehive.spec.ts` )

**Happy Path**
- Creates a BeeHive profile and asserts stored authority/name/balance.
- Records tip logs and updates BeeHive stats.
- Tracks sequential comment IDs and balances for multiple supporters.
- Allows partial cashout, verifying profile balance decrease and wallet increase.
- Closes a BeeHive profile and drains its tip logs/rent.
- Returns residual lamports when closing with provided tip logs (remaining accounts).

**Unhappy Path**
- Rejects creating two profiles in the same slot (seed collision).
- Prevents the authority from tipping their own profile (`SelfTippingForbidden`).
- Rejects profile creation when slot ≥ MAX_PROFILES_PER_AUTHORITY.
- Rejects profile names exceeding MAX_PROFILE_NAME.
- Enforces minimum tip lamports (amount below threshold fails).
- Rejects messages longer than MAX_TIP_MESSAGE.
- Prevents non-authorities from cashing out (authority constraint).
- Leaves tip logs untouched if not provided when closing (so rent stays until passed).
- Prevents non-authorities from closing a profile (ConstraintSeeds violation).

### Running Tests
```bash
cd anchor_project
anchor test        # standard command (spins up internal validator)
# or scripted helper that kills existing validators, builds, deploys, tests:
./run-tests.sh
```

---

## Development & Deployment

### Backend (Anchor)
```bash
cd anchor_project
npm install                # install workspace deps
anchor build

# Deploy to devnet
solana config set --url devnet
anchor deploy --provider.cluster Devnet
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start   # production
```

Cluster selection + wallet adapter are available in the header; choose Devnet to talk to the deployed program.

---

## Additional Notes
- Cleanup helper (`anchor_project/scripts/cleanup-local.js`) closes all BeeHive profiles belonging to your wallet in a dev/local environment.
- Every time the Anchor program changes, run `anchor build` and copy the refreshed IDL/types into `frontend/src/idl/tipping.json` and `frontend/src/types/tipping.ts`.
- The frontend is deployed on Vercel and pre-configured to use the devnet program ID. Update `.env.local` if you redeploy to another cluster.

BeeHive demonstrates PDAs, account ownership constraints, and a full-stack (Anchor + React) workflow for Solana Chapter 1.*** End Patch
