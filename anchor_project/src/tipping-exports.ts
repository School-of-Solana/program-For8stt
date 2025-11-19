import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TippingIDL from '../target/idl/tipping.json'
import type { Tipping } from '../target/types/tipping'

export { Tipping, TippingIDL }

export const TIPPING_PROGRAM_ID = new PublicKey(TippingIDL.address)

export function getTippingProgram(provider: AnchorProvider) {
  return new Program(TippingIDL as Tipping, provider)
}

export function getTippingProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return new PublicKey('46SS66ojgt3YBDmDPJci7tvnQLSKzXd2t5tiVmHiY3D3')
    case 'mainnet-beta':
    default:
      return TIPPING_PROGRAM_ID
  }
}
