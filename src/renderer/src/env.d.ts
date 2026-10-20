/// <reference types="vite/client" />

import type { BirthdaylyApi } from '@shared/ipc'

declare global {
  interface Window {
    birthdayly: BirthdaylyApi
  }
}

export {}
