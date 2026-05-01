/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DOUBAO_ENDPOINT?: string;
  readonly VITE_DOUBAO_MODEL?: string;
  readonly VITE_DOUBAO_API_KEY?: string;
  readonly VITE_AMAP_KEY?: string;
  readonly VITE_AMAP_SECURITY_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
