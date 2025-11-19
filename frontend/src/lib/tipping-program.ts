import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TippingIDL from '@/idl/tipping.json'
import type { Tipping } from '@/types/tipping'

export { TippingIDL }

export const TIPPING_PROGRAM_ID = new PublicKey(TippingIDL.address)

export function getTippingProgram(provider: AnchorProvider) {
  return new Program(TippingIDL as Tipping, provider)
}

export function getTippingProgramId(network: Cluster) {
  switch (network) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('46SS66ojgt3YBDmDPJci7tvnQLSKzXd2t5tiVmHiY3D3')
    case 'mainnet-beta':
    default:
      return TIPPING_PROGRAM_ID
  }
}
