import {BeeHiveAccountsOverview} from '@/components/beehive/beehive-accounts-overview'

const insightCards = [
  {
    title: 'Up to 3 living vaults',
    body: 'Slot-specific PDAs keep your campaigns segmented. Sunset and recycle a slot anytime.',
    stat: '3 slots',
  },
  {
    title: 'Commented gratitude',
    body: 'Every supporter can leave a 200-char message. Showcase wins and shoutouts publicly.',
    stat: '200 chars',
  },
  {
    title: 'Owner-only exits',
    body: 'Withdrawals and account closes are strictly owner-signed, so funds stay sovereign.',
    stat: 'Owner sigs',
  },
]

const signals = [
  {
    title: 'New supporters pulse',
    caption: 'Latest BeeHive accounts receive their first tip within minutes once shared.',
  },
  {
    title: 'Momentum tracker',
    caption: 'Each BeeHive shows aggregate SOL from day one, so you instantly feel growth.',
  },
  {
    title: 'Archive ready',
    caption: 'Close a BeeHive to snapshot comments, clean storage, and reclaim precious slots.',
  },
]

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1A0004] via-[#0D0000] to-[#2A0008] p-8 shadow-[0_25px_65px_rgba(0,0,0,0.65)]">
        <p className="text-xs uppercase tracking-[0.4em] text-rose-200/80">My BeeHive</p>
        <div className="mt-4 space-y-4">
          <h1 className="text-4xl font-semibold text-rose-50">Track every BeeHive vault in one cockpit</h1>
          <p className="text-rose-100/80 text-lg">
            Monitor balances, replay supporter comments, and close dormant campaigns from a single dashboard.
          </p>
          <div className="grid gap-4 md:grid-cols-3 pt-4">
            {signals.map((signal) => (
              <div
                key={signal.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-rose-100/80"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-rose-200/70">{signal.title}</p>
                <p className="mt-2 text-sm">{signal.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <BeeHiveAccountsOverview />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {insightCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-[#E23A1E]/25 bg-gradient-to-br from-[#2A0008] via-[#1A0004] to-[#0D0000] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
          >
            <p className="text-xs uppercase tracking-[0.5em] text-[#EF5C2F]/80">{card.stat}</p>
            <h3 className="mt-2 text-xl font-semibold text-rose-50">{card.title}</h3>
            <p className="mt-3 text-sm text-rose-100/80">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
