import { app, powerMonitor } from 'electron'
import { registerPrivilegedSchemes, installAvatarProtocol } from './security/protocol'
import { denyExtraPermissions, installContentSecurityPolicy } from './security/csp'
import { openDatabase } from './database/connection'
import { migrate } from './database/migrate'
import { createContactsRepository } from './database/contactsRepository'
import { createSettingsRepository } from './database/settingsRepository'
import { createNotificationHistoryRepository } from './database/notificationHistoryRepository'
import { createReminderOverrideRepository } from './database/reminderOverrideRepository'
import { createAvatarService } from './services/avatarService'
import { createContactService } from './services/contactService'
import { createImportExportService } from './services/importExportService'
import { applyAutoLaunch } from './services/autoLaunch'
import { createReminderChecker, startReminderLoop } from './notifications/scheduler'
import { configureWindowsNotifications } from './notifications/windowsIdentity'
import { applyNativeTheme, createMainWindow } from './windows/mainWindow'
import { syncTray } from './tray/createTray'
import { registerIpc } from './ipc/registerIpc'
import { runtime, showMainWindow } from './runtime'

registerPrivilegedSchemes()

configureWindowsNotifications()

const hasLock = app.requestSingleInstanceLock()
if (!hasLock) {
  app.quit()
} else {
  app.on('second-instance', () => showMainWindow())
  app.on('before-quit', (event) => {
    if (runtime.isQuitting || !runtime.minimizeToTray) return
    event.preventDefault()
  })

  void app.whenReady().then(() => {
    const database = openDatabase()
    migrate(database)
    const avatars = createAvatarService()
    const settings = createSettingsRepository(database)
    const contacts = createContactService(createContactsRepository(database), avatars)
    const history = createNotificationHistoryRepository(database)
    const overrides = createReminderOverrideRepository(database)
    const reminders = createReminderChecker(contacts, settings, history, overrides)
    const transfer = createImportExportService(contacts, avatars, () => runtime.mainWindow)
    const current = settings.get()
    runtime.minimizeToTray = current.minimizeToTray

    installAvatarProtocol(avatars)
    installContentSecurityPolicy()
    denyExtraPermissions()
    applyNativeTheme(current)
    applyAutoLaunch(current.autoLaunch)
    createMainWindow(current)

    const refreshTray = (): void => {
      syncTray({
        language: settings.get().language,
        onOpen: () => showMainWindow(),
        onCheck: () => reminders.check(),
        onQuit: () => {
          runtime.isQuitting = true
          app.quit()
        }
      })
    }
    refreshTray()

    registerIpc({
      contacts,
      settings,
      transfer,
      reminders,
      onSettingsChanged: (next, patch) => {
        runtime.minimizeToTray = next.minimizeToTray
        applyNativeTheme(next)
        applyAutoLaunch(next.autoLaunch)
        refreshTray()
        reminders.check(patch.reminderTime ? { reschedule: true } : undefined)
      }
    })

    const stopLoop = startReminderLoop(reminders)
    const showMissedReminders = (): void => {
      reminders.check({ includeUnacknowledged: true })
    }
    powerMonitor.on('resume', showMissedReminders)
    powerMonitor.on('unlock-screen', showMissedReminders)
    app.on('will-quit', () => stopLoop())

    app.on('activate', () => {
      if (runtime.mainWindow && !runtime.mainWindow.isDestroyed()) showMainWindow()
      else createMainWindow(settings.get())
    })
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin' && !runtime.minimizeToTray) app.quit()
    })
  })
}
