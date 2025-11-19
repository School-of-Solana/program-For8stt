'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { redirect } from 'next/navigation'

const perks = [
  {
    title: 'Snapshot balances',
    detail: 'Check native SOL and SPL token accounts in one scan.',
  },
  {
    title: 'Speed-run airdrops',
    detail: 'Trigger testnet/localnet airdrops without leaving the page.',
  },
  {
    title: 'Signature radar',
    detail: 'Replay the last few transactions as soon as you connect.',
  },
]

export default function AccountListFeature() {
  const { publicKey } = useWallet()

  if (publicKey) {
    return redirect(`/account/${publicKey.toString()}`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 space-y-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] p-10 text-center shadow-[0_30px_55px_rgba(0,0,0,0.65)] space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">Account cockpit</p>
        <h1 className="text-4xl font-semibold text-rose-50">Connect a wallet to inspect balances & signatures</h1>
        <p className="text-rose-100/80 text-lg">
          Jump into your on-chain activity with tailored diagnostics for SOL, SPL tokens, and transaction logs.
        </p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {perks.map((perk) => (
          <div
            key={perk.title}
            className="rounded-2xl border border-white/10 bg-black/30 p-5 text-left text-rose-100/80 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">{perk.title}</p>
            <p className="mt-3 text-sm">{perk.detail}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
