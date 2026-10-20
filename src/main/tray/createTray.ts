import { Menu, Tray } from 'electron'
import { messages } from '@shared/i18n'
import type { Language } from '@shared/types'
import { loadIcon } from '../assets'
import { runtime, showMainWindow } from '../runtime'

export function syncTray(input: {
  language: Language
  onOpen: () => void
  onCheck: () => void
  onQuit: () => void
}): void {
  if (!runtime.tray) {
    const icon = loadIcon('tray.png')
    const base = icon.isEmpty() ? loadIcon('icon.png') : icon
    runtime.tray = new Tray(base.resize({ width: 32, height: 32 }))
    runtime.tray.setToolTip('Birthdayly')
    runtime.tray.on('click', () => showMainWindow())
    runtime.tray.on('double-click', () => showMainWindow())
  }
  const copy = messages(input.language)
  const menu = Menu.buildFromTemplate([
    { label: copy.actions.open, click: () => input.onOpen() },
    { label: copy.actions.checkReminders, click: () => input.onCheck() },
    { type: 'separator' },
    { label: copy.actions.quit, click: () => input.onQuit() }
  ])
  runtime.tray.setContextMenu(menu)
}
