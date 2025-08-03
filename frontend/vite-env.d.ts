/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ETH_CONTRACT_ADDRESS: string
  readonly VITE_COSMOS_CONTRACT_ADDRESS: string
  readonly VITE_ETHEREUM_CHAIN_ID?: string
  readonly VITE_ETHEREUM_RPC_URL?: string
  readonly VITE_COSMOS_CHAIN_ID?: string
  readonly VITE_COSMOS_RPC_URL?: string
  readonly VITE_ONEINCH_API_KEY?: string
  readonly VITE_ENABLE_TESTNET?: string
  readonly VITE_ENABLE_ANALYTICS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
