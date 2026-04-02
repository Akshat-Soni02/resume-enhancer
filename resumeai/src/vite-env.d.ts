/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JOB_SPACES_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
