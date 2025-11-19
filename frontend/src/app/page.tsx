"use client";

import Link from "next/link";

const actions = [
  {
    title: "Create Signature BeeHive Accounts",
    description:
      "Spin up up to three unique BeeHive vaults per wallet and brand them with your story.",
    highlight: "Self-custodied PDAs tied to your wallet.",
  },
  {
    title: "Share & Collect Tips Globally",
    description:
      "Accept SOL from fans, clients, or supporters with verifiable receipts and message feeds.",
    highlight: "Fast Solana settlement and message tracking.",
  },
  {
    title: "Withdraw & Close Anytime",
    description:
      "Redeem accumulated tips or sunset a campaign in one click—messages are cleaned up automatically.",
    highlight: "Owner-only withdrawals with PDA safety.",
  },
];

const benefits = [
  {
    title: "Transparent Social Proof",
    body: "Each tip leaves a public note so communities can celebrate contributions on-chain.",
  },
  {
    title: "Ultra-Low Fees",
    body: "Solana transactions stay sub-cent, so creators keep almost every lamport tipped.",
  },
  {
    title: "No Middleman Accounts",
    body: "Tips flow directly into PDAs you control—no custodial platforms, no withdrawal delays.",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen w-full py-16">
      <section className="text-center px-4 max-w-4xl mx-auto space-y-6">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-rose-200/80">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Solana-native BeeHive
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-rose-50 leading-tight">
          Reward creators, communities, and teammates with{" "}
          <span className="text-rose-300">instant micropayments</span>.
        </h1>
        <p className="text-lg md:text-xl text-rose-100/80">
          Build personal BeeHive accounts, share comment-rich tip feeds, and cash out when you are
          ready—all from a single dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/beeHive"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-400 text-white font-semibold shadow-lg shadow-rose-900/60 hover:scale-[1.02] transition"
          >
            Launch BeeHive
          </Link>
          <Link
            href="/beeHive/accounts"
            className="px-8 py-3 rounded-full border border-rose-400/60 text-rose-100 font-semibold hover:bg-white/10 transition"
          >
            View my BeeHive
          </Link>
        </div>
      </section>

      <section className="mt-16 px-4">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {actions.map((card) => (
            <article
              key={card.title}
              className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-lg shadow-black/40 backdrop-blur"
            >
              <h3 className="text-xl font-semibold text-rose-100">{card.title}</h3>
              <p className="text-rose-100/80 mt-3">{card.description}</p>
              <p className="mt-4 text-sm text-rose-300">{card.highlight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1A0004] to-[#2A0008] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50 space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-400">Why choose us</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-rose-50">
              Benefits beyond a donation link
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-black/25 rounded-2xl border border-white/5 p-6">
                <h3 className="text-xl font-semibold text-rose-100">{benefit.title}</h3>
                <p className="text-rose-100/75 mt-3">{benefit.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-rose-200/80">
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              PDAs stay unique per slot
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Comments auto-pruned on close
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Wallet-gated withdrawals
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
