import './globals.css'
import {ClusterProvider} from '@/components/cluster/cluster-data-access'
import {SolanaProvider} from '@/components/solana/solana-provider'
import {UiLayout} from '@/components/ui/ui-layout'
import {ReactQueryProvider} from './react-query-provider'

export const metadata = {
  title: 'BeeHive',
  description: 'BeeHive — decentralized gratitude hub built for Solana creators',
}

type NavLink = { label: string; path: string; accent?: boolean; secondary?: boolean; ghost?: boolean }

const links: NavLink[] = [
  { label: 'BeeHive', path: '/beeHive', accent: true },
  { label: 'My BeeHive', path: '/beeHive/accounts', secondary: true },
  { label: 'Account', path: '/account', ghost: true },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <UiLayout links={links}>{children}</UiLayout>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
