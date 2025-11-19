import {BeeHiveAccountPage} from '@/components/beehive/beehive-account-page'

export default function Page({params}: {params: {account: string}}) {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <BeeHiveAccountPage account={params.account} />
    </div>
  )
}
