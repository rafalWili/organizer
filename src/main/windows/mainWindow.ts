import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'node:path'
import type { Settings } from '@shared/types'
import { loadIcon } from '../assets'
import { isHttpsUrl, openHttps } from '../security/external'
import { hideMainWindow, runtime } from '../runtime'

export function createMainWindow(settings: Settings): BrowserWindow {
  const dark =
    settings.theme === 'dark' || (settings.theme === 'system' && nativeTheme.shouldUseDarkColors)
  const window = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: 'Birthdayly',
    backgroundColor: dark ? '#0e0e13' : '#e7e3f6',
    autoHideMenuBar: true,
    icon: loadIcon('icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  runtime.mainWindow = window
  window.once('ready-to-show', () => window.show())
  window.on('close', (event) => {
    if (runtime.isQuitting || !runtime.minimizeToTray) return
    event.preventDefault()
    setImmediate(() => hideMainWindow())
  })
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isHttpsUrl(url)) openHttps(url)
    return { action: 'deny' }
  })
  window.webContents.on('did-fail-load', (_event, code, description) => {
    console.error('Renderer failed to load', code, description)
  })
  window.webContents.on('console-message', (event) => {
    if (event.message.includes('Refused') || event.message.includes('Content Security Policy')) {
      console.error(event.message)
    }
  })
  window.webContents.on('will-navigate', (event, url) => {
    if (isAllowedNavigation(url)) return
    event.preventDefault()
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) void window.loadURL(rendererUrl)
  else void window.loadFile(join(__dirname, '../renderer/index.html'))
  return window
}

function isAllowedNavigation(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!app.isPackaged && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) return true
    return parsed.protocol === 'file:'
  } catch {
    return false
  }
}

export function applyNativeTheme(settings: Settings): void {
  nativeTheme.themeSource = settings.theme === 'system' ? 'system' : settings.theme
}
