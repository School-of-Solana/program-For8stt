import { useBeeHiveProgram } from "./beehive-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { ellipsify } from "../ui/ui-layout";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const LAMPORTS_PER_SOL = 1_000_000_000;
const beehiveButtonClass =
  "btn border-0 bg-gradient-to-r from-[#E23A1E] via-[#EF5C2F] to-[#B02117] text-white shadow-[0_10px_25px_rgba(226,58,30,0.35)] hover:shadow-[0_15px_35px_rgba(239,92,47,0.45)] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:shadow-none disabled:translate-y-0";
const beehiveGhostButtonClass =
  "btn border border-[#EF5C2F]/60 bg-transparent text-[#EF5C2F] hover:bg-[#E23A1E]/15 hover:border-[#EF5C2F]/80 transition-all";
const beehiveCardClass =
  "card bg-gradient-to-br from-[#0D0000]/95 via-[#1A0004]/90 to-[#2A0008]/95 text-rose-100 border border-white/5 shadow-[0_25px_45px_rgba(8,0,0,0.65)] backdrop-blur";

export function BeeHiveCreate() {
  const beehive = useBeeHiveProgram();
  const { createProfile, getOwnedAccounts, getAvailableSlots, accounts } = beehive;
  const wallet = useWallet();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!wallet.publicKey) {
      setSelectedSlot(null);
      return;
    }
    const available = getAvailableSlots(wallet.publicKey);
    setSelectedSlot(available.length > 0 ? available[0] : null);
  }, [wallet.publicKey?.toString(), accounts.data?.length]);

  const handleCreate = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (selectedSlot === null) {
      toast.error("Maximum BeeHive accounts created (3)");
      return;
    }

    if (!name.trim().length) {
      toast.error("Please enter a name for your BeeHive account");
      return;
    }

    if (name.trim().length > 32) {
      toast.error("Name must be 32 characters or less");
      return;
    }

    createProfile.mutate({ slot: selectedSlot, name: name.trim() });
    setName("");
  };

  return (
    <div className="flex flex-col gap-3 items-start">
      <p className="text-sm text-gray-400">
        Each wallet can own up to three BeeHive accounts. Choose a slot (0-2) for the new PDA.
      </p>
      <div className="flex gap-3 flex-wrap items-center">
        <select
          className="select select-bordered bg-black/40 border-[#E23A1E]/40 text-rose-50 focus:border-[#EF5C2F] focus:outline-none"
          disabled={!wallet.connected}
          value={selectedSlot ?? ""}
          onChange={(e) => setSelectedSlot(Number(e.target.value))}
        >
          <option value="" disabled>
            {wallet.connected ? "Select slot" : "Connect wallet"}
          </option>
          {wallet.publicKey &&
            getAvailableSlots(wallet.publicKey).map((slot) => (
              <option key={slot} value={slot}>
                Slot {slot}
              </option>
            ))}
        </select>
        <input
          type="text"
          className="input input-bordered bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none"
          placeholder="BeeHive account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          disabled={!wallet.connected}
        />
        <button className={beehiveButtonClass} onClick={handleCreate}>
          Create BeeHive Account
        </button>
      </div>
      {wallet.publicKey && getOwnedAccounts(wallet.publicKey).length >= 3 && (
        <p className="text-red-500 text-sm">
          You already have 3 BeeHive accounts. Close one before creating another.
        </p>
      )}
    </div>
  );
}

export function BeeHiveWithdraw() {
  const { cashout, getOwnedAccounts } = useBeeHiveProgram();
  const wallet = useWallet();
  const [amount, setAmount] = useState(0.1);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const ownedAccounts = wallet.publicKey ? getOwnedAccounts(wallet.publicKey) : [];

  useEffect(() => {
    if (ownedAccounts.length > 0) {
      setSelectedAccount(ownedAccounts[0].publicKey.toString());
    } else {
      setSelectedAccount("");
    }
  }, [
    ownedAccounts.length,
    ownedAccounts.map((a: any) => a.publicKey.toString()).join(","),
  ]);

  const handleWithdraw = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!selectedAccount) {
      toast.error("No BeeHive account selected");
      return;
    }

    try {
      await cashout.mutateAsync({
        profilePda: new PublicKey(selectedAccount),
        amount,
      });
    } catch (error: any) {
      alert(`Failed to withdraw: ${error.message}`);
      console.error("Error during withdrawal:", error);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <h2 className="text-lg font-bold">Withdraw Tips</h2>
      {ownedAccounts.length === 0 ? (
        <p className="text-sm text-gray-500">
          Create a BeeHive account to withdraw from it.
        </p>
      ) : (
        <>
          <select
            className="select select-bordered w-full max-w-xs bg-black/40 border-[#E23A1E]/40 text-rose-50 focus:border-[#EF5C2F] focus:outline-none"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {ownedAccounts.map((account: any) => (
              <option key={account.publicKey.toString()} value={account.publicKey.toString()}>
                {account.account.name || `Slot ${account.account.slot}`} — {ellipsify(account.publicKey.toString())}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Amount (SOL)"
              className="input input-bordered bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 w-32 focus:border-[#EF5C2F] focus:outline-none"
              step={0.01}
              min={0}
            />
            <button className={beehiveButtonClass} onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function BeeHiveList() {
  const { accounts, closeProfile, giveTip } = useBeeHiveProgram();
  const wallet = useWallet();
  const [tipAmounts, setTipAmounts] = useState<Record<string, string>>({});
  const [tipNotes, setTipNotes] = useState<Record<string, string>>({});
  const parseTipError = (error: any): string => {
    const code =
      error?.error?.errorCode?.code ||
      error?.errorCode?.code ||
      (typeof error?.message === "string" ? error.message : "");

    if (typeof code !== "string") return "";
    if (code.includes("SelfTippingForbidden")) {
      return "You cannot reward your own BeeHive.";
    }
    if (code.includes("InsufficientAmount")) {
      return "Tip amount did not meet the minimum threshold.";
    }
    if (code.includes("MessageTooLong")) {
      return "Tip message exceeds the allowed length.";
    }

    return "";
  };

  const handleSendTip = async (
    accountPublicKey: string,
    amountInput: string,
    noteInput: string
  ) => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet first.");
      return;
    }

    const amount = parseFloat(amountInput);

    if (isNaN(amount)) {
      toast.error("Enter a valid tip amount");
      return;
    }

    if (amount < 0.1) {
      toast.error("Minimum tip is 0.1 SOL");
      return;
    }

    try {
      const tx = await giveTip(new PublicKey(accountPublicKey), amount, noteInput);
      toast.success(`Tip sent! Signature: ${tx}`);
      setTipAmounts((prev) => ({ ...prev, [accountPublicKey]: "0.10" }));
      setTipNotes((prev) => ({ ...prev, [accountPublicKey]: "" }));
    } catch (error: any) {
      const friendlyMessage = parseTipError(error);
      if (friendlyMessage) {
        toast.error(friendlyMessage);
      } else {
        toast.error("Failed to send tip. Please try again.");
      }
      console.error("Error sending tip:", error);
    }
  };

  const handleCloseAccount = async (accountPublicKey: string) => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      await closeProfile.mutateAsync(new PublicKey(accountPublicKey));
    } catch (error: any) {
      toast.error(`Failed to close BeeHive account - ${error.message}`);
    }
  };

  if (accounts.isLoading) return <p>Loading...</p>;
  if (accounts.error) return <p>Error loading accounts</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:mx-24 mx-8 mb-12">
      {accounts.data !== undefined ? (
        accounts.data.map((account: any) => {
          const isAuthority =
            wallet.publicKey &&
            wallet.publicKey.toString() === account.account.authority.toString();
          const ownerGlow =
            "relative overflow-hidden ring-2 ring-[#EF5C2F]/70 shadow-[0_0_35px_rgba(239,92,47,0.35)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#EF5C2F]/20 before:via-transparent before:to-[#EF5C2F]/5 before:blur-3xl before:pointer-events-none";
          return (
            <div
              key={account.publicKey.toString()}
              className={`${beehiveCardClass} ${isAuthority ? ownerGlow : ""}`}
            >
            <div className="card-body space-y-4 w-full">
              <div className="flex flex-col gap-1">
                <h2 className="card-title text-2xl text-rose-50">
                  {account.account.name || "BeeHive Account"}
                </h2>
                <p className="text-xs uppercase tracking-widest text-rose-200/70">
                  {ellipsify(account.publicKey.toString())}
                </p>
              </div>

              <div className="flex justify-between text-sm text-rose-100/70 items-center">
                <span>Authority: {ellipsify(account.account.authority.toString())}</span>
                <div className="flex items-center gap-2">
                  <span>Slot #{account.account.slot}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E23A1E]/30 bg-gradient-to-r from-[#2A0008] via-[#1A0004] to-[#0D0000] p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-100/50">
                  Total balance
                </p>
                <p className="text-3xl font-semibold text-[#EF5C2F] drop-shadow-[0_4px_25px_rgba(239,92,47,0.45)]">
                  {(
                    Number(account.account.balance) / LAMPORTS_PER_SOL
                  ).toFixed(2)}{" "}
                  SOL
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <input
                  type="number"
                  min={0.1}
                  step={0.01}
                  className="input input-bordered w-full bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none"
                  placeholder="Amount in SOL"
                  value={tipAmounts[account.publicKey.toString()] ?? "0.10"}
                  onChange={(e) =>
                    setTipAmounts((prev) => ({
                      ...prev,
                      [account.publicKey.toString()]: e.target.value,
                    }))
                  }
                />

                <textarea
                  className="textarea textarea-bordered w-full bg-black/30 border-[#E23A1E]/35 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none"
                  placeholder="Comment (optional)"
                  value={tipNotes[account.publicKey.toString()] ?? ""}
                  onChange={(e) =>
                    setTipNotes((prev) => ({
                      ...prev,
                      [account.publicKey.toString()]: e.target.value,
                    }))
                  }
                  maxLength={200}
                />

                <button
                  className={beehiveButtonClass}
                  onClick={() =>
                    handleSendTip(
                      account.publicKey.toString(),
                      tipAmounts[account.publicKey.toString()] ?? "0.10",
                      tipNotes[account.publicKey.toString()] ?? ""
                    )
                  }
                >
                  Send Tip
                </button>

                {isAuthority && (
                    <button
                      className={beehiveGhostButtonClass}
                      onClick={() => handleCloseAccount(account.publicKey.toString())}
                    >
                      Close Account
                    </button>
                  )}
              </div>
            </div>
          </div>
          );
        })
      ) : (
        <div></div>
      )}
    </div>
  );
}
