import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

import { Tipping } from "../target/types/tipping";
import { airdrop } from "./utils";

const PROFILE_SEED = "profile";
const TIP_LOG_SEED = "tip_log";
const LAMPORTS = anchor.web3.LAMPORTS_PER_SOL;
const MIN_TIP = Math.floor(anchor.web3.LAMPORTS_PER_SOL / 10); // mirrors MIN_TIP_LAMPORTS

const extractAnchorCode = (error: any): string | undefined =>
  error?.error?.errorCode?.code ?? error?.errorCode?.code;

describe("BeeHive program behaviours", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const program = anchor.workspace.Tipping as Program<Tipping>;

  const deriveProfilePda = (authority: anchor.web3.PublicKey, slot: number) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(PROFILE_SEED), authority.toBuffer(), Buffer.from([slot])],
      program.programId
    )[0];
  };

  const deriveTipLogPda = (profile: anchor.web3.PublicKey, tipIndex: number) => {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64LE(BigInt(tipIndex));
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(TIP_LOG_SEED), profile.toBuffer(), counter],
      program.programId
    )[0];
  };

  let creator: anchor.web3.Keypair;
  let supporterOne: anchor.web3.Keypair;
  let supporterTwo: anchor.web3.Keypair;
  let outsider: anchor.web3.Keypair;
  let primaryProfilePda: anchor.web3.PublicKey;

  before(async () => {
    creator = anchor.web3.Keypair.generate();
    supporterOne = anchor.web3.Keypair.generate();
    supporterTwo = anchor.web3.Keypair.generate();
    outsider = anchor.web3.Keypair.generate();

    await Promise.all([
      airdrop({ connection, publicKey: creator.publicKey, amount: 200 * LAMPORTS }),
      airdrop({ connection, publicKey: supporterOne.publicKey, amount: 200 * LAMPORTS }),
      airdrop({ connection, publicKey: supporterTwo.publicKey, amount: 200 * LAMPORTS }),
      airdrop({ connection, publicKey: outsider.publicKey, amount: 200 * LAMPORTS }),
    ]);
  });

  it("creates a BeeHive profile for the authority", async () => {
    const slot = 0;
    primaryProfilePda = deriveProfilePda(creator.publicKey, slot);

    await program.methods
      .createProfile(slot, "Queen Hive")
      .accounts({
        authority: creator.publicKey,
        profile: primaryProfilePda,
      })
      .signers([creator])
      .rpc();

    const storedProfile = await program.account.profileAccount.fetch(primaryProfilePda);
    expect(storedProfile.authority.toBase58()).to.equal(creator.publicKey.toBase58());
    expect(storedProfile.name).to.equal("Queen Hive");
    expect(Number(storedProfile.balance)).to.equal(0);
  });

  it("rejects creating two profiles in the same slot", async () => {
    let caught: Error | null = null;
    try {
      await program.methods
        .createProfile(0, "Duplicate Hive")
        .accounts({
          authority: creator.publicKey,
          profile: primaryProfilePda,
        })
        .signers([creator])
        .rpc();
    } catch (error: any) {
      caught = error;
    }
    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("already in use");
  });

  it("records tip logs and updates BeeHive stats", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const nextLogId = Number(profileBefore.nextCommentId);
    const tipLogPda = deriveTipLogPda(primaryProfilePda, nextLogId);
    const tipAmount = new anchor.BN(2 * LAMPORTS);

    await program.methods
      .giveTip(tipAmount, "Early supporter")
      .accounts({
        profile: primaryProfilePda,
        contributor: supporterOne.publicKey,
        tipLog: tipLogPda,
      })
      .signers([supporterOne])
      .rpc();

    const updatedProfile = await program.account.profileAccount.fetch(primaryProfilePda);
    const storedTipLog = await program.account.tipLog.fetch(tipLogPda);

    expect(Number(updatedProfile.balance)).to.equal(Number(tipAmount));
    expect(Number(updatedProfile.tipCount)).to.equal(1);
    expect(storedTipLog.message).to.equal("Early supporter");
    expect(storedTipLog.sender.toBase58()).to.equal(supporterOne.publicKey.toBase58());
  });

  it("tracks sequential comment ids and balances for multiple supporters", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const baseIdx = Number(profileBefore.nextCommentId);
    const firstLogPda = deriveTipLogPda(primaryProfilePda, baseIdx);
    const secondLogPda = deriveTipLogPda(primaryProfilePda, baseIdx + 1);

    await program.methods
      .giveTip(new anchor.BN(MIN_TIP + LAMPORTS / 20), "supporter one streak")
      .accounts({
        profile: primaryProfilePda,
        contributor: supporterOne.publicKey,
        tipLog: firstLogPda,
      })
      .signers([supporterOne])
      .rpc();

    await program.methods
      .giveTip(new anchor.BN(MIN_TIP + LAMPORTS / 15), "supporter two streak")
      .accounts({
        profile: primaryProfilePda,
        contributor: supporterTwo.publicKey,
        tipLog: secondLogPda,
      })
      .signers([supporterTwo])
      .rpc();

    const updatedProfile = await program.account.profileAccount.fetch(primaryProfilePda);
    const firstLog = await program.account.tipLog.fetch(firstLogPda);
    const secondLog = await program.account.tipLog.fetch(secondLogPda);

    expect(Number(updatedProfile.tipCount)).to.equal(Number(profileBefore.tipCount) + 2);
    expect(Number(updatedProfile.nextCommentId)).to.equal(baseIdx + 2);
    expect(firstLog.message).to.equal("supporter one streak");
    expect(secondLog.message).to.equal("supporter two streak");
    expect(firstLog.recordedAt).to.exist;
    expect(secondLog.recordedAt).to.exist;
    const firstRecordedAt = (firstLog.recordedAt as anchor.BN).toNumber();
    const secondRecordedAt = (secondLog.recordedAt as anchor.BN).toNumber();
    expect(secondRecordedAt).to.be.greaterThan(firstRecordedAt);
  });

  it("prevents the BeeHive owner from tipping their own profile", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const nextLogId = Number(profileBefore.nextCommentId);
    const tipLogPda = deriveTipLogPda(primaryProfilePda, nextLogId);
    let caught: Error | null = null;

    try {
      await program.methods
        .giveTip(new anchor.BN(1 * LAMPORTS), "self boost")
        .accounts({
          profile: primaryProfilePda,
          contributor: creator.publicKey,
          tipLog: tipLogPda,
        })
        .signers([creator])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("SelfTippingForbidden");
  });

  it("allows the authority to cash out part of the balance", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const withdrawAmount = new anchor.BN(Number(profileBefore.balance) / 2 || LAMPORTS);
    const ownerBalanceBefore = await connection.getBalance(creator.publicKey);

    await program.methods
      .cashout(withdrawAmount)
      .accounts({
        profile: primaryProfilePda,
        authority: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const profileAfter = await program.account.profileAccount.fetch(primaryProfilePda);
    const ownerBalanceAfter = await connection.getBalance(creator.publicKey);

    expect(Number(profileAfter.balance)).to.equal(
      Number(profileBefore.balance) - Number(withdrawAmount)
    );
    expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
  });

  it("closes a BeeHive profile and drains its tip logs", async () => {
    const slot = 1;
    const closingProfile = deriveProfilePda(creator.publicKey, slot);

    await program.methods
      .createProfile(slot, "Short lived hive")
      .accounts({
        authority: creator.publicKey,
        profile: closingProfile,
      })
      .signers([creator])
      .rpc();

    const closingProfileAccount = await program.account.profileAccount.fetch(closingProfile);
    const initialTipLog = deriveTipLogPda(
      closingProfile,
      Number(closingProfileAccount.nextCommentId)
    );

    await program.methods
      .giveTip(new anchor.BN(1 * LAMPORTS), "See you soon")
      .accounts({
        profile: closingProfile,
        contributor: supporterTwo.publicKey,
        tipLog: initialTipLog,
      })
      .signers([supporterTwo])
      .rpc();

    await program.methods
      .closeProfile()
      .accounts({
        profile: closingProfile,
        authority: creator.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: initialTipLog,
          isWritable: true,
          isSigner: false,
        },
      ])
      .signers([creator])
      .rpc();

    const closedProfileInfo = await connection.getAccountInfo(closingProfile);
    const closedTipLogInfo = await connection.getAccountInfo(initialTipLog);

    expect(closedProfileInfo).to.equal(null);
    expect(closedTipLogInfo).to.equal(null);
  });

  it("returns residual lamports to the authority when closing with tip logs", async () => {
    const slot = 1;
    const payoutProfile = deriveProfilePda(outsider.publicKey, slot);

    await program.methods
      .createProfile(slot, "Payout Hive")
      .accounts({
        authority: outsider.publicKey,
        profile: payoutProfile,
      })
      .signers([outsider])
      .rpc();

    const tipLogPda = deriveTipLogPda(payoutProfile, 0);
    await program.methods
      .giveTip(new anchor.BN(MIN_TIP), "closing soon")
      .accounts({
        profile: payoutProfile,
        contributor: supporterOne.publicKey,
        tipLog: tipLogPda,
      })
      .signers([supporterOne])
      .rpc();

    const ownerBalanceBefore = await connection.getBalance(outsider.publicKey);

    await program.methods
      .closeProfile()
      .accounts({
        profile: payoutProfile,
        authority: outsider.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: tipLogPda,
          isWritable: true,
          isSigner: false,
        },
      ])
      .signers([outsider])
      .rpc();

    const ownerBalanceAfter = await connection.getBalance(outsider.publicKey);
    const closedProfile = await connection.getAccountInfo(payoutProfile);
    const closedTipLog = await connection.getAccountInfo(tipLogPda);

    expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
    expect(closedProfile).to.equal(null);
    expect(closedTipLog).to.equal(null);
  });

  it("rejects creating a profile when slot exceeds MAX_PROFILES_PER_AUTHORITY", async () => {
    const slot = 5; // greater than MAX_PROFILES_PER_AUTHORITY (3)
    const invalidPda = deriveProfilePda(creator.publicKey, slot);
    let caught: Error | null = null;
    try {
      await program.methods
        .createProfile(slot, "Overflow slot")
        .accounts({
          authority: creator.publicKey,
          profile: invalidPda,
        })
        .signers([creator])
        .rpc();
    } catch (error: any) {
      caught = error;
    }
    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("InvalidSlot");
  });

  it("rejects creating a profile when name exceeds MAX_PROFILE_NAME", async () => {
    const slot = 2;
    const pda = deriveProfilePda(outsider.publicKey, slot);
    const longName = "A".repeat(64);
    let caught: Error | null = null;

    try {
      await program.methods
        .createProfile(slot, longName)
        .accounts({
          authority: outsider.publicKey,
          profile: pda,
        })
        .signers([outsider])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("NameTooLong");
  });

  it("enforces minimum tip lamports", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const nextLogId = Number(profileBefore.nextCommentId);
    const tipLogPda = deriveTipLogPda(primaryProfilePda, nextLogId);
    let caught: Error | null = null;

    try {
      await program.methods
        .giveTip(new anchor.BN(MIN_TIP - 1), "too small")
        .accounts({
          profile: primaryProfilePda,
          contributor: supporterTwo.publicKey,
          tipLog: tipLogPda,
        })
        .signers([supporterTwo])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("InsufficientAmount");
  });

  it("rejects messages that exceed MAX_TIP_MESSAGE characters", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const nextLogId = Number(profileBefore.nextCommentId);
    const tipLogPda = deriveTipLogPda(primaryProfilePda, nextLogId);
    const longMessage = "B".repeat(400);
    let caught: Error | null = null;

    try {
      await program.methods
        .giveTip(new anchor.BN(MIN_TIP), longMessage)
        .accounts({
          profile: primaryProfilePda,
          contributor: supporterTwo.publicKey,
          tipLog: tipLogPda,
        })
        .signers([supporterTwo])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    expect(caught).to.not.equal(null);
    expect(caught?.message || "").to.include("MessageTooLong");
  });

  it("prevents non-authorities from cashing out", async () => {
    const profileBefore = await program.account.profileAccount.fetch(primaryProfilePda);
    const withdrawAmount = new anchor.BN(1 * LAMPORTS);
    const outsiderBalanceBefore = await connection.getBalance(supporterOne.publicKey);
    let caught: Error | null = null;

    try {
      await program.methods
        .cashout(withdrawAmount)
        .accounts({
          profile: primaryProfilePda,
          authority: supporterOne.publicKey,
        })
        .signers([supporterOne])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    const outsiderBalanceAfter = await connection.getBalance(supporterOne.publicKey);
    const profileAfter = await program.account.profileAccount.fetch(primaryProfilePda);

    expect(caught).to.not.equal(null);
    expect(extractAnchorCode(caught)).to.equal("ConstraintSeeds");
    expect(Number(profileAfter.balance)).to.equal(Number(profileBefore.balance));
    expect(outsiderBalanceAfter).to.equal(outsiderBalanceBefore);
  });

  it("leaves tip logs untouched when not provided during close", async () => {
    const slot = 2;
    const profilePda = deriveProfilePda(supporterOne.publicKey, slot);

    await program.methods
      .createProfile(slot, "Needs cleanup")
      .accounts({
        authority: supporterOne.publicKey,
        profile: profilePda,
      })
      .signers([supporterOne])
      .rpc();

    const tipLogPda = deriveTipLogPda(profilePda, 0);
    await program.methods
      .giveTip(new anchor.BN(MIN_TIP), "attach me")
      .accounts({
        profile: profilePda,
        contributor: supporterTwo.publicKey,
        tipLog: tipLogPda,
      })
      .signers([supporterTwo])
      .rpc();

    await program.methods
      .closeProfile()
      .accounts({
        profile: profilePda,
        authority: supporterOne.publicKey,
      })
      .signers([supporterOne])
      .rpc();

    const closedProfileInfo = await connection.getAccountInfo(profilePda);
    const danglingTipLog = await connection.getAccountInfo(tipLogPda);

    expect(closedProfileInfo).to.equal(null);
    expect(danglingTipLog).to.not.equal(null);
    expect(danglingTipLog?.owner.toBase58()).to.equal(program.programId.toBase58());
    expect(danglingTipLog?.lamports ?? 0).to.be.greaterThan(0);
  });

  it("prevents non-authorities from closing a profile", async () => {
    const slot = 0;
    const protectedAuthority = outsider;
    const protectedProfile = deriveProfilePda(protectedAuthority.publicKey, slot);

    await program.methods
      .createProfile(slot, "Guarded Hive")
      .accounts({
        authority: protectedAuthority.publicKey,
        profile: protectedProfile,
      })
      .signers([protectedAuthority])
      .rpc();

    let caught: Error | null = null;
    try {
      await program.methods
        .closeProfile()
        .accounts({
          profile: protectedProfile,
          authority: supporterOne.publicKey,
        })
        .signers([supporterOne])
        .rpc();
    } catch (error: any) {
      caught = error;
    }

    expect(caught).to.not.equal(null);
    expect(extractAnchorCode(caught)).to.equal("ConstraintSeeds");

    await program.methods
      .closeProfile()
      .accounts({
        profile: protectedProfile,
        authority: protectedAuthority.publicKey,
      })
      .signers([protectedAuthority])
      .rpc();
  });
});
