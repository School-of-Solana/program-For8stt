"use client"

import {useBeeHiveProgram} from '@/components/beehive/beehive-data-access'
import {useWallet} from '@solana/wallet-adapter-react'
import {PublicKey} from '@solana/web3.js'
import {ellipsify} from '@/components/ui/ui-layout'

const LAMPORTS_PER_SOL = 1_000_000_000

function formatTimestamp(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—'
  return new Date(seconds * 1000).toLocaleString()
}

export function BeeHiveAccountsOverview() {
  const {accounts, getOwnedAccounts, getCommentsForAccount} = useBeeHiveProgram()
  const wallet = useWallet()

  if (!wallet.connected || !wallet.publicKey) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 text-rose-100 shadow-[0_25px_45px_rgba(0,0,0,0.35)]">
        Connect your wallet to view your BeeHive accounts.
      </div>
    )
  }

  if (accounts.isLoading) {
    return (
      <div className="rounded-3xl border border-white/5 bg-white/5 p-6 flex items-center justify-center text-rose-100">
        Loading BeeHive accounts…
      </div>
    )
  }
  if (accounts.error) {
    return (
      <div className="rounded-3xl border border-[#E23A1E]/30 bg-red-900/30 p-6 text-rose-50">
        Failed to load BeeHive accounts.
      </div>
    )
  }

  const ownedAccounts = getOwnedAccounts(wallet.publicKey)

  if (!ownedAccounts.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/20 bg-black/30 p-8 text-center text-rose-200">
        You have no BeeHive accounts yet. Spin one up to start receiving notes + tips.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {ownedAccounts.map((entry: any) => {
        const tipLogs = getCommentsForAccount(new PublicKey(entry.publicKey.toString()))
        const totalLamports = tipLogs.reduce(
          (sum: number, log: any) => sum + Number(log.account.lamports),
          0
        )
        const totalSol = totalLamports / LAMPORTS_PER_SOL
        const tipsCount = entry.account.tipCount
          ? Number(entry.account.tipCount)
          : tipLogs.length
        const avgTip = tipLogs.length ? totalSol / tipLogs.length : 0
        const latestComment = tipLogs.length ? tipLogs[tipLogs.length - 1] : null
        const recentComments = tipLogs.length ? tipLogs.slice(-3).reverse() : []
        const nextCommentPointer =
          entry.account.nextCommentId && typeof entry.account.nextCommentId.toString === 'function'
            ? entry.account.nextCommentId.toString()
            : tipLogs.length.toString()

        return (
          <div
            key={entry.publicKey.toString()}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] p-6 shadow-[0_25px_45px_rgba(0,0,0,0.6)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">BeeHive Vault</p>
                <h2 className="mt-2 text-3xl font-semibold text-rose-50">{entry.account.name || 'BeeHive Account'}</h2>
                <p className="text-sm text-rose-200/70">{ellipsify(entry.publicKey.toString())}</p>
              </div>
              <div className="rounded-2xl border border-[#E23A1E]/30 bg-black/30 px-6 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200/60">Total received</p>
                <p className="text-4xl font-semibold text-[#EF5C2F]">{totalSol.toFixed(2)} SOL</p>
                <p className="text-xs text-rose-200/60 mt-1">Slot #{entry.account.slot}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-rose-100/90">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Tips logged</p>
                <p className="mt-2 text-2xl font-semibold">{tipsCount}</p>
                <p className="text-xs text-rose-200/70">Supporter notes stored on-chain</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-rose-100/90">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Avg contribution</p>
                <p className="mt-2 text-2xl font-semibold">{avgTip ? avgTip.toFixed(2) : '0.00'} SOL</p>
                <p className="text-xs text-rose-200/70">Calculated from all incoming tips</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-rose-100/90">
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Last supporter</p>
                <p className="mt-2 text-xl font-semibold">
                  {latestComment ? ellipsify(latestComment.account.sender.toBase58()) : 'Awaiting tip'}
                </p>
                <p className="text-xs text-rose-200/70">{formatTimestamp(Number(latestComment?.account.recordedAt))}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-rose-200/60 mb-2">
                  <span>Recent activity</span>
                  <span>Most recent first</span>
                </div>
                {recentComments.length === 0 ? (
                  <div className="text-sm text-rose-200/70">No tips yet.</div>
                ) : (
                  <div className="space-y-3">
                    {recentComments.map((tip: any) => (
                      <div
                        key={tip.publicKey.toBase58()}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-rose-100/90"
                      >
                        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-rose-200/70">
                          <span>{ellipsify(tip.account.sender.toBase58())}</span>
                          <span>{(Number(tip.account.lamports) / LAMPORTS_PER_SOL).toFixed(2)} SOL</span>
                        </div>
                        <p className="mt-2">{tip.account.message || '—'}</p>
                        <p className="mt-1 text-[11px] text-rose-200/60">{formatTimestamp(Number(tip.account.recordedAt))}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-dashed border-[#EF5C2F]/40 bg-[#0D0000]/60 p-4 text-sm text-rose-100/80">
                <p className="text-xs uppercase tracking-[0.3em] text-[#EF5C2F]/80">Authority insights</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <span className="text-rose-50 font-semibold">Available slot:</span>{' '}
                    <span>#{entry.account.slot}</span>
                  </li>
                  <li>
                    <span className="text-rose-50 font-semibold">Authority:</span> {ellipsify(entry.account.authority.toString())}
                  </li>
                  <li>
                    <span className="text-rose-50 font-semibold">Comment buffer:</span> <span>#{nextCommentPointer}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
