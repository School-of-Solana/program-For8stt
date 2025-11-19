"use client";

import { Buffer } from "buffer";
import {
  getTippingProgram,
  getTippingProgramId,
} from "@/lib/tipping-program";
import { Cluster, PublicKey, PublicKeyInitData } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { BN } from "@coral-xyz/anchor";

const LAMPORTS_PER_SOL = 1_000_000_000;
const MAX_PROFILE_ACCOUNTS = 3;
const PROFILE_SEED = "profile";
const TIP_LOG_SEED = "tip_log";

const toLamports = (amount: number) =>
  new BN(Math.floor(amount * LAMPORTS_PER_SOL));

const deriveProfilePda = (authority: PublicKeyInitData, slot: number, programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PROFILE_SEED), new PublicKey(authority).toBuffer(), Buffer.from([slot])],
    programId
  )[0];
};

const deriveTipLogPda = (
  profileAccount: PublicKeyInitData,
  commentId: number,
  programId: PublicKey
) => {
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(BigInt(commentId));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TIP_LOG_SEED), new PublicKey(profileAccount).toBuffer(), idBuffer],
    programId
  )[0];
};

export function useBeeHiveProgram() {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getTippingProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getTippingProgram(provider);
  const accountClients = program.account as Record<string, any>;
  const profileAccountClient = accountClients.profileAccount;
  const tipLogClient = accountClients.tipLog;

  const accounts = useQuery({
    queryKey: ["beeHive", "profiles", { cluster }],
    queryFn: () => profileAccountClient.all(),
  });

  const comments = useQuery({
    queryKey: ["beeHive", "logs", { cluster }],
    queryFn: () => tipLogClient.all(),
  });

  const createProfile = useMutation({
    mutationKey: ["beeHive", "create-profile", { cluster }],
    mutationFn: ({ slot, name }: { slot: number; name: string }) => {
      if (!provider.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      const pda = deriveProfilePda(provider.wallet.publicKey, slot, program.programId);

      if (!name.trim().length) {
        throw new Error("Name cannot be empty");
      }

      return program.methods
        .createProfile(slot, name)
        .accounts({ authority: provider.wallet.publicKey, profile: pda })
        .signers([])
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature as string);
      await accounts.refetch();
      return comments.refetch();
    },
    onError: (error: any) =>
      toast.error(`Failed to create BeeHive profile - ${error}`),
  });

  const cashout = useMutation({
    mutationKey: ["beeHive", "cashout", { cluster }],
    mutationFn: ({
      profilePda,
      amount,
    }: {
      profilePda: PublicKey;
      amount: number;
    }) => {
      if (!provider.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }
      return program.methods
        .cashout(toLamports(amount))
        .accounts({
          authority: provider.wallet.publicKey,
          profile: profilePda,
        })
        .signers([])
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature as string);
      return accounts.refetch();
    },
    onError: (error: any) =>
      toast.error(`Failed to cash out tips - ${error}`),
  });

  const closeProfile = useMutation({
    mutationKey: ["beeHive", "close-profile", { cluster }],
    mutationFn: (profilePda: PublicKey) => {
      if (!provider.wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      const relatedLogs = comments.data
        ? comments.data.filter(
            (entry: any) => entry.account.profile.toBase58() === profilePda.toBase58()
          )
        : [];

      return program.methods
        .closeProfile()
        .accounts({
          authority: provider.wallet.publicKey,
          profile: profilePda,
        })
        .remainingAccounts(
          relatedLogs.map((entry: any) => ({
            pubkey: entry.publicKey,
            isWritable: true,
            isSigner: false,
          }))
        )
        .signers([])
        .rpc();
    },
    onSuccess: async (signature) => {
      transactionToast(signature as string);
      await accounts.refetch();
      return comments.refetch();
    },
    onError: (error: any) =>
      toast.error(`Failed to close BeeHive account - ${error}`),
  });

  const getOwnedProfiles = (walletPublicKey: PublicKey | null) => {
    if (!accounts.data || !walletPublicKey) return [];
    return accounts.data.filter(
      (account: any) =>
        account.account.authority.toString() === walletPublicKey.toString()
    );
  };

  const getAvailableSlots = (walletPublicKey: PublicKey | null) => {
    const owned = getOwnedProfiles(walletPublicKey);
    const usedSlots = owned.map(
      (account: any) => account.account.slot as number
    );
    return Array.from({ length: MAX_PROFILE_ACCOUNTS }, (_, i) => i).filter(
      (slot) => !usedSlots.includes(slot)
    );
  };

  const getCommentsForAccount = (accountPublicKey: PublicKey | null | string) => {
    if (!comments.data || !accountPublicKey) return [];
    const key =
      typeof accountPublicKey === "string" ? accountPublicKey : accountPublicKey.toBase58();
    return comments.data
      .filter((entry: any) => entry.account.profile.toBase58() === key)
      .sort(
        (a: any, b: any) =>
          Number(a.account.recordedAt ?? 0) - Number(b.account.recordedAt ?? 0)
      );
  };

  const giveTip = async (profileAccount: PublicKey, amount: number, message: string) => {
    if (!provider.wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    const accountData = await profileAccountClient.fetch(profileAccount);
    const nextCommentIdBn =
      (accountData.nextCommentId as BN | undefined) ?? new BN(0);
    const commentIndex = Number(nextCommentIdBn.toString());
    const tipLogPda = deriveTipLogPda(
      profileAccount,
      commentIndex,
      program.programId
    );

    const signature = await program.methods
      .giveTip(toLamports(amount), message)
      .accounts({
        profile: profileAccount,
        tipLog: tipLogPda,
        contributor: provider.wallet.publicKey,
      })
      .signers([])
      .rpc();

    await accounts.refetch();
    await comments.refetch();
    return signature;
  };

  return {
    program,
    programId,
    accounts,
    comments,
    createProfile,
    cashout,
    closeProfile,
    getOwnedAccounts: getOwnedProfiles,
    getAvailableSlots,
    getCommentsForAccount,
    giveTip,
  };
}

export function useBeeHiveProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, giveTip } = useBeeHiveProgram();
  const profileAccountClient = (program.account as any).profileAccount;

  const accountQuery = useQuery({
    queryKey: ["beeHive", "fetch", { cluster, account }],
    queryFn: () => profileAccountClient.fetch(account),
  });

  const sendTipMutation = useMutation({
    mutationKey: ["beeHive", "send", { cluster, account }],
    mutationFn: (amount: number) => giveTip(account, amount, ""),
    onSuccess: (signature) => {
      transactionToast(signature as string);
      return accountQuery.refetch();
    },
    onError: (error: any) =>
      toast.error(`Failed send tip - ${error}`),
  });

  return {
    accountQuery,
    sendTipMutation,
  };
}
