/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_STOREFRONT_TOKEN?: string
  readonly VITE_SHOPIFY_DOMAIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
