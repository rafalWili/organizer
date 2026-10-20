import type { BrowserWindow, Tray } from 'electron'

export const runtime = {
  isQuitting: false,
  minimizeToTray: true,
  mainWindow: null as BrowserWindow | null,
  tray: null as Tray | null
}

export function showMainWindow(): void {
  const window = runtime.mainWindow
  if (!window || window.isDestroyed()) return
  window.setSkipTaskbar(false)
  if (window.isMinimized()) window.restore()
  window.show()
  window.focus()
}

export function hideMainWindow(): void {
  const window = runtime.mainWindow
  if (!window || window.isDestroyed()) return
  window.hide()
  window.setSkipTaskbar(true)
}
