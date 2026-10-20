import { app, shell } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const PACKAGED_APP_ID = 'com.birthdayly.app'

export function configureWindowsNotifications(): void {
  if (process.platform !== 'win32') return
  if (app.isPackaged) {
    app.setAppUserModelId(PACKAGED_APP_ID)
    return
  }

  const appId = process.execPath
  app.setAppUserModelId(appId)
  const shortcutPath = join(
    process.env.APPDATA ?? '',
    'Microsoft',
    'Windows',
    'Start Menu',
    'Programs',
    'Birthdayly.lnk'
  )
  try {
    const current = existsSync(shortcutPath) ? shell.readShortcutLink(shortcutPath) : null
    if (current?.target === process.execPath && current.appUserModelId === appId) return
    shell.writeShortcutLink(shortcutPath, {
      target: process.execPath,
      args: process.cwd(),
      cwd: process.cwd(),
      appUserModelId: appId,
      description: 'Birthdayly'
    })
  } catch (error) {
    console.error('Could not register the Windows notification shortcut', error)
  }
}
