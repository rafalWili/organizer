import { Notification } from 'electron'
import { messages } from '@shared/i18n'
import { birthdayNotification, testNotification } from '@shared/notificationsCopy'
import type { Language, ReminderType } from '@shared/types'
import { loadIcon } from '../assets'
import { showMainWindow } from '../runtime'

let supportedWarningShown = false

export function canNotify(): boolean {
  if (Notification.isSupported()) return true
  if (!supportedWarningShown) {
    supportedWarningShown = true
    console.warn('System notifications are not supported in this session.')
  }
  return false
}

export function deliverBirthdayNotification(
  input: {
    language: Language
    reminderType: ReminderType
    firstName: string
    age: number | null
  },
  handlers: { onShow: () => void; onFail: () => void; onAcknowledge: () => void; onRemindLater: () => void }
): boolean {
  if (!canNotify()) return false
  const copy = birthdayNotification(input.language, input.reminderType, input.firstName, input.age)
  const labels = messages(input.language)
  let handled = false
  const notification = new Notification({
    title: copy.title,
    body: copy.body,
    silent: false,
    timeoutType: 'never',
    icon: loadIcon('icon.png'),
    actions: [
      { type: 'button', text: labels.actions.ok },
      { type: 'button', text: labels.actions.remindLater }
    ]
  })
  notification.on('action', (details) => {
    handled = true
    if (details.actionIndex === 1) handlers.onRemindLater()
    else handlers.onAcknowledge()
  })
  notification.on('click', () => {
    handled = true
    handlers.onAcknowledge()
    showMainWindow()
  })
  notification.on('close', (details) => {
    if (handled) return
    if (details.reason === 'userCanceled') handlers.onAcknowledge()
  })
  notification.on('show', () => handlers.onShow())
  notification.on('failed', (_event, error) => {
    console.error('Birthday notification failed', error)
    handlers.onFail()
  })
  notification.show()
  return true
}

export function deliverTestNotification(language: Language): boolean {
  if (!canNotify()) return false
  const copy = testNotification(language)
  const notification = new Notification({
    title: copy.title,
    body: copy.body,
    silent: false,
    icon: loadIcon('icon.png')
  })
  notification.on('failed', (_event, error) => {
    console.error('Test notification failed', error)
  })
  notification.on('click', () => showMainWindow())
  notification.show()
  return true
}
