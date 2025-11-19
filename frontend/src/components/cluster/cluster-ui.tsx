'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { IconChevronDown, IconTrash, IconWorld } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { AppModal } from '../ui/ui-layout'
import { ClusterNetwork, useCluster } from './cluster-data-access'
import { Connection } from '@solana/web3.js'

const accentButtonClass =
  'btn border-0 bg-gradient-to-r from-[#E23A1E] via-[#EF5C2F] to-[#B02117] text-white shadow-[0_12px_35px_rgba(226,58,30,0.45)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:translate-y-0'
const outlineButtonClass =
  'btn border border-[#EF5C2F]/60 bg-transparent text-[#EF5C2F] hover:bg-[#E23A1E]/15 hover:border-[#EF5C2F]/80 transition-all duration-200 active:scale-95 disabled:opacity-40'

export function ExplorerLink({ path, label, className }: { path: string; label: string; className?: string }) {
  const { getExplorerUrl } = useCluster()
  return (
    <a
      href={getExplorerUrl(path)}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono`}
    >
      {label}
    </a>
  )
}

export function ClusterChecker({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const { connection } = useConnection()

  const query = useQuery({
    queryKey: ['version', { cluster, endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getVersion(),
    retry: 1,
  })
  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 border border-[#EF5C2F]/50 bg-[#2A0008]/70 px-4 py-3 text-rose-100">
        <span>
          Error connecting to <strong>{cluster.name}</strong>
        </span>
        <button className={`${accentButtonClass} btn-xs`} onClick={() => query.refetch()}>
          Refresh
        </button>
      </div>
    )
  }
  return children
}

export function ClusterUiSelect() {
  const { clusters, setCluster, cluster } = useCluster()
  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0D0000]/90 to-[#2A0008]/90 px-3 py-2.5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.65)] transition hover:border-[#EF5C2F]/50"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E23A1E]/15 text-[#EF5C2F]">
          <IconWorld size={20} />
        </span>
        <span className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.4em] text-rose-200/70">Network</span>
          <span className="text-sm font-semibold text-rose-50">{cluster.name}</span>
          <span className="text-xs text-rose-200/70">{cluster.network ?? 'custom'}</span>
        </span>
        <IconChevronDown className="ml-auto text-rose-200/70" size={16} />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content mt-4 w-64 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0D0000] via-[#1A0004] to-[#2A0008] p-3 shadow-[0_25px_55px_rgba(0,0,0,0.6)]"
      >
        <div className="space-y-2">
          {clusters.map((item) => (
            <button
              key={item.name}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                item.active
                  ? 'border-[#EF5C2F]/70 bg-[#EF5C2F]/10 text-rose-50'
                  : 'border-white/10 bg-transparent text-rose-200 hover:border-[#EF5C2F]/50 hover:text-rose-50'
              }`}
              onClick={() => setCluster(item)}
            >
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-rose-200/70">{item.network ?? 'custom'}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ClusterUiModal({ hideModal, show }: { hideModal: () => void; show: boolean }) {
  const { addCluster } = useCluster()
  const [name, setName] = useState('')
  const [network, setNetwork] = useState<ClusterNetwork | undefined>()
  const [endpoint, setEndpoint] = useState('')

  return (
    <AppModal
      title={'Add Cluster'}
      hide={hideModal}
      show={show}
      submit={() => {
        try {
          new Connection(endpoint)
          if (name) {
            addCluster({ name, network, endpoint })
            hideModal()
          } else {
            console.log('Invalid cluster name')
          }
        } catch {
          console.log('Invalid cluster endpoint')
        }
      }}
      submitLabel="Save"
    >
      <input
        type="text"
        placeholder="Name"
        className="input input-bordered w-full bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Endpoint"
        className="input input-bordered w-full bg-black/40 border-[#E23A1E]/40 text-rose-50 placeholder:text-rose-200/60 focus:border-[#EF5C2F] focus:outline-none"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
      />
      <select
        className="select select-bordered w-full bg-black/40 border-[#E23A1E]/40 text-rose-50 focus:border-[#EF5C2F] focus:outline-none"
        value={network}
        onChange={(e) => setNetwork(e.target.value as ClusterNetwork)}
      >
        <option value={undefined}>Select a network</option>
        <option value={ClusterNetwork.Devnet}>Devnet</option>
        {/* <option value={ClusterNetwork.Testnet}>Testnet</option>
        <option value={ClusterNetwork.Mainnet}>Mainnet</option> */}
      </select>
    </AppModal>
  )
}

export function ClusterUiTable() {
  const { clusters, setCluster, deleteCluster } = useCluster()
  return (
    <div className="space-y-4">
      {clusters.map((item) => (
        <div
          key={item.name}
          className={`rounded-3xl border p-6 shadow-[0_20px_45px_rgba(0,0,0,0.55)] ${
            item.active
              ? 'border-[#EF5C2F]/70 bg-gradient-to-r from-[#2A0008]/80 to-[#0D0000]/80'
              : 'border-white/10 bg-black/30'
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Cluster</p>
              <h3 className="text-2xl font-semibold text-rose-50">{item.name}</h3>
              <p className="text-sm text-rose-200/70">Network: {item.network ?? 'custom'}</p>
              <p className="text-xs text-rose-200/50 break-all mt-1">{item.endpoint}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={item.active}
                className={
                  item.active ? `${outlineButtonClass} btn-xs opacity-60` : `${outlineButtonClass} btn-xs`
                }
                onClick={() => setCluster(item)}
              >
                {item.active ? 'Active' : 'Set active'}
              </button>
              <button
                disabled={item.active}
                className={`${accentButtonClass} btn-xs`}
                onClick={() => {
                  if (!window.confirm('Are you sure?')) return
                  deleteCluster(item)
                }}
              >
                <IconTrash size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
