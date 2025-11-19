'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useBeeHiveProgram } from './beehive-data-access'
import { BeeHiveWithdraw, BeeHiveCreate, BeeHiveList } from './beehive-ui'

export default function BeeHiveFeature() {
  const { publicKey } = useWallet()
  const { programId } = useBeeHiveProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="BeeHive"
        subtitle="Create a BeeHive account and send tips on-chain!"
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <BeeHiveCreate />
        <br />
        <BeeHiveWithdraw />
      </AppHero>
      <BeeHiveList />
    </div>
  ) : (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] p-10 text-center shadow-[0_30px_55px_rgba(0,0,0,0.65)] space-y-6">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">BeeHive tips</p>
        <h1 className="text-4xl font-semibold text-rose-50">Connect a wallet to build your BeeHive vaults</h1>
        <p className="text-lg text-rose-100/80">
          Spin up BeeHive PDAs, collect comment-rich SOL tips, and withdraw whenever you are ready. Everything starts by
          linking your wallet.
        </p>
        <div className="flex justify-center">
          <WalletButton />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: '3 PDA slots',
            body: 'Create up to three BeeHive accounts per wallet for different campaigns.',
          },
          {
            title: 'Comment streams',
            body: 'Every incoming tip can carry a note, perfect for shoutouts and testimonials.',
          },
          {
            title: 'Owner withdrawals',
            body: 'Only the BeeHive owner wallet can withdraw or close—no custodial hoops.',
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-black/30 p-5 text-left text-rose-100/80 shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">{card.title}</p>
            <p className="mt-3 text-sm">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
