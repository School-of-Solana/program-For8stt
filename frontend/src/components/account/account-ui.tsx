'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { IconRefresh } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AppModal, ellipsify } from '../ui/ui-layout'
import { useCluster } from '../cluster/cluster-data-access'
import { ExplorerLink } from '../cluster/cluster-ui'
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
} from './account-data-access'

const accentButtonClass =
  'btn border-0 bg-gradient-to-r from-[#E23A1E] via-[#EF5C2F] to-[#B02117] text-white shadow-[0_12px_35px_rgba(226,58,30,0.45)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0'
const outlineButtonClass =
  'btn border border-[#EF5C2F]/60 bg-transparent text-[#EF5C2F] hover:bg-[#E23A1E]/15 hover:border-[#EF5C2F]/80 transition-all duration-200 active:scale-95 disabled:opacity-40'
const cardShellClass =
  'rounded-3xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] p-6 shadow-[0_25px_45px_rgba(0,0,0,0.55)] text-rose-50'
const mutedCardClass = 'rounded-2xl border border-white/10 bg-black/30'
const inputClass =
  'input input-bordered bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none'

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <div
      className="inline-flex flex-col items-center gap-2 text-rose-50 cursor-pointer"
      onClick={() => query.refetch()}
    >
      <span className="text-xs uppercase tracking-[0.4em] text-rose-200/80">Wallet balance</span>
      <div className="flex items-baseline gap-2 text-5xl font-bold">
        <span>{query.data ? <BalanceSol balance={query.data} /> : '…'}</span>
        <span className="text-lg font-semibold text-rose-200">SOL</span>
      </div>
    </div>
  )
}
export function AccountChecker() {
  const { publicKey } = useWallet()
  if (!publicKey) {
    return null
  }
  return <AccountBalanceCheck address={publicKey} />
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster()
  const mutation = useRequestAirdrop({ address })
  const query = useGetBalance({ address })

  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 border border-[#EF5C2F]/50 bg-[#2A0008]/60 px-4 py-3 text-rose-100">
        <span className="text-sm">
          You are connected to <strong>{cluster.name}</strong> but your account is not funded yet.
        </span>
        <button
          className={`${accentButtonClass} btn-xs`}
          onClick={() => mutation.mutateAsync(1).catch((err) => console.log(err))}
        >
          Request Airdrop
        </button>
      </div>
    )
  }
  return null
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet()
  const { cluster } = useCluster()
  const [showAirdropModal, setShowAirdropModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  return (
    <div>
      <ModalAirdrop hide={() => setShowAirdropModal(false)} address={address} show={showAirdropModal} />
      <ModalReceive address={address} show={showReceiveModal} hide={() => setShowReceiveModal(false)} />
      <ModalSend address={address} show={showSendModal} hide={() => setShowSendModal(false)} />
      <div className="flex flex-wrap gap-3">
        <button
          disabled={cluster.network?.includes('mainnet')}
          className={`${accentButtonClass} btn-xs lg:btn-md`}
          onClick={() => setShowAirdropModal(true)}
        >
          Airdrop
        </button>
        <button
          disabled={wallet.publicKey?.toString() !== address.toString()}
          className={`${accentButtonClass} btn-xs lg:btn-md`}
          onClick={() => setShowSendModal(true)}
        >
          Send
        </button>
        <button className={`${outlineButtonClass} btn-xs lg:btn-md`} onClick={() => setShowReceiveModal(true)}>
          Receive
        </button>
      </div>
    </div>
  )
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false)
  const query = useGetTokenAccounts({ address })
  const client = useQueryClient()
  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className={`${cardShellClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">Token accounts</p>
          <h2 className="text-2xl font-semibold text-rose-50">Live SPL balances</h2>
        </div>
        <div className="flex items-center gap-2">
          {query.isLoading ? (
            <span className="loading loading-spinner text-rose-200"></span>
          ) : (
            <button
              className={`${outlineButtonClass} btn-sm`}
              onClick={async () => {
                await query.refetch()
                await client.invalidateQueries({
                  queryKey: ['getTokenAccountBalance'],
                })
              }}
            >
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-900/30 p-4 text-red-100">
          Error: {query.error?.message.toString()}
        </div>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className={`${mutedCardClass} p-4 text-rose-200/80`}>No token accounts found.</div>
          ) : (
            <div className={`${mutedCardClass} overflow-x-auto`}>
              <table className="table w-full text-rose-100">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.3em] text-rose-200/70">
                    <th>Public Key</th>
                    <th>Mint</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map(({ account, pubkey }) => (
                    <tr key={pubkey.toString()}>
                      <td className="font-mono text-sm">
                        <ExplorerLink label={ellipsify(pubkey.toString())} path={`account/${pubkey.toString()}`} />
                      </td>
                      <td className="font-mono text-sm">
                        <ExplorerLink
                          label={ellipsify(account.data.parsed.info.mint)}
                          path={`account/${account.data.parsed.info.mint.toString()}`}
                        />
                      </td>
                      <td className="text-right font-mono">{account.data.parsed.info.tokenAmount.uiAmount}</td>
                    </tr>
                  ))}

                  {(query.data?.length ?? 0) > 5 && (
                    <tr>
                      <td colSpan={3} className="text-center">
                        <button className={`${outlineButtonClass} btn-xs`} onClick={() => setShowAll(!showAll)}>
                          {showAll ? 'Show Less' : 'Show All'}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className={`${cardShellClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-rose-200/70">Transaction history</p>
          <h2 className="text-2xl font-semibold text-rose-50">Latest signature trail</h2>
        </div>
        <div className="flex items-center gap-2">
          {query.isLoading ? (
            <span className="loading loading-spinner text-rose-200"></span>
          ) : (
            <button className={`${outlineButtonClass} btn-sm`} onClick={() => query.refetch()}>
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-900/30 p-4 text-red-100">
          Error: {query.error?.message.toString()}
        </div>
      )}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className={`${mutedCardClass} p-4 text-rose-200/80`}>No transactions found.</div>
          ) : (
            <div className={`${mutedCardClass} overflow-x-auto`}>
              <table className="table w-full text-rose-100">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.3em] text-rose-200/70">
                    <th>Signature</th>
                    <th className="text-right">Slot</th>
                    <th>Block Time</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item) => (
                    <tr key={item.signature}>
                      <th className="font-mono">
                        <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                      </th>
                      <td className="font-mono text-right">
                        <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                      </td>
                      <td>{new Date((item.blockTime ?? 0) * 1000).toLocaleString()}</td>
                      <td className="text-right">
                        {item.err ? (
                          <span
                            className="inline-flex items-center rounded-full border border-red-500/60 px-3 py-1 text-xs text-red-200"
                            title={JSON.stringify(item.err)}
                          >
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-400/60 px-3 py-1 text-xs text-emerald-200">
                            Success
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(query.data?.length ?? 0) > 5 && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        <button className={`${outlineButtonClass} btn-xs`} onClick={() => setShowAll(!showAll)}>
                          {showAll ? 'Show Less' : 'Show All'}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BalanceSol({ balance }: { balance: number }) {
  return <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
}

function ModalReceive({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code className="mt-3 block rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-rose-100 break-all">
        {address.toString()}
      </code>
    </AppModal>
  )
}

function ModalAirdrop({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const mutation = useRequestAirdrop({ address })
  const [amount, setAmount] = useState('2')

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className={`${inputClass} w-full`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}

function ModalSend({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const wallet = useWallet()
  const mutation = useTransferSol({ address })
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('1')

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide())
      }}
    >
      <input
        disabled={mutation.isPending}
        type="text"
        placeholder="Destination"
        className={`${inputClass} w-full`}
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className={`${inputClass} w-full`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}
