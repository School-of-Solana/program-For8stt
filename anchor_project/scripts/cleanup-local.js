#!/usr/bin/env node
const anchor = require("@coral-xyz/anchor");
const { PublicKey } = anchor.web3;

const PROFILE_SEED = "profile";
const MAX_PROFILES = 3;

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Tipping;
  if (!program) {
    throw new Error("Program workspace not found. Run `anchor build` first.");
  }

  const owner = provider.wallet.publicKey;
  console.log(`Using wallet: ${owner.toBase58()}`);

  const tipLogs = await program.account.tipLog.all();

  for (let slot = 0; slot < MAX_PROFILES; slot++) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from(PROFILE_SEED), owner.toBuffer(), Buffer.from([slot])],
      program.programId
    );

    let exists = true;
    try {
      await program.account.profileAccount.fetch(pda);
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      console.log(`Slot ${slot}: no account at ${pda.toBase58()}`);
      continue;
    }

    console.log(`Closing slot ${slot} (${pda.toBase58()})...`);

    const relatedLogs = tipLogs
      .filter((entry) => entry.account.profile.equals(pda))
      .map((entry) => ({
        pubkey: entry.publicKey,
        isWritable: true,
        isSigner: false,
      }));

    await program.methods
      .closeProfile()
      .accounts({ authority: owner, profile: pda })
      .remainingAccounts(relatedLogs)
      .rpc();
    console.log(`Closed slot ${slot}.`);
  }

  console.log("Cleanup complete.");
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
