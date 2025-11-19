"use client"

import {useBeeHiveProgram} from '@/components/beehive/beehive-data-access'
import {useWallet} from '@solana/wallet-adapter-react'
import {PublicKey} from '@solana/web3.js'
import {ellipsify} from '@/components/ui/ui-layout'

export function BeeHiveAccountPage({account}: {account: string}) {
  const {accounts, getCommentsForAccount} = useBeeHiveProgram()
  const wallet = useWallet()
  const accountPublicKey = new PublicKey(account)

  if (accounts.isLoading) return <div>Loading...</div>
  if (accounts.error) return <div>Error loading account.</div>

  const profileAccount = accounts.data?.find((entry: any) => entry.publicKey.toBase58() === account)

  if (!profileAccount) {
    return <div>BeeHive account not found.</div>
  }

  const comments = getCommentsForAccount(accountPublicKey)
  const isOwner =
    wallet.publicKey && wallet.publicKey.toBase58() === profileAccount.account.authority.toBase58()

  return (
    <div className="space-y-6">
      <div className="border rounded p-6 shadow">
        <h1 className="text-2xl font-bold">{profileAccount.account.name || 'BeeHive Account'}</h1>
        <p className="text-sm text-gray-500">{ellipsify(account)}</p>
        <div className="mt-4 space-y-2">
          <p>
            <strong>Authority:</strong> {ellipsify(profileAccount.account.authority.toBase58())}
          </p>
          <p>
            <strong>Slot:</strong> {profileAccount.account.slot}
          </p>
          <p>
            <strong>Total Amount:</strong>{' '}
            {(Number(profileAccount.account.balance) / 1_000_000_000).toFixed(4)} SOL
          </p>
          {isOwner ? <p className="text-green-600 text-sm">You are the owner of this account.</p> : null}
        </div>
      </div>

      <div className="border rounded p-6 shadow">
        <h2 className="text-xl font-semibold mb-2">Tip History</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">No tips yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((entry: any) => (
              <div key={entry.publicKey.toBase58()} className="border-b pb-3 last:border-none">
                <p className="text-sm text-gray-500">
                  {new Date(Number(entry.account.recordedAt) * 1000).toLocaleString()}
                </p>
                <p>
                  <strong>From:</strong> {ellipsify(entry.account.sender.toBase58())}
                </p>
                <p>
                  <strong>Amount:</strong>{' '}
                  {(Number(entry.account.lamports) / 1_000_000_000).toFixed(4)} SOL
                </p>
                {entry.account.message ? (
                  <p className="italic text-gray-700">“{entry.account.message}”</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
