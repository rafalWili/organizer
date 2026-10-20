import { shell } from 'electron'

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function openHttps(value: string): void {
  if (!isHttpsUrl(value)) return
  void shell.openExternal(value)
}
