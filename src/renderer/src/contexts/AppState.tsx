import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS } from '@shared/defaults'
import { toCalendarDate } from '@shared/dates'
import { errorText, messages } from '@shared/i18n'
import type { ApiResult } from '@shared/ipc'
import type { CalendarDate, Contact, ContactInput, PageId, Settings, TodaySnoozeRequest } from '@shared/types'

interface AppStateValue {
  ready: boolean
  fatalError: string | null
  settings: Settings
  contacts: Contact[]
  page: PageId
  today: CalendarDate
  version: string
  setPage: (page: PageId) => void
  openCalendar: (date?: CalendarDate) => void
  calendarFocus: CalendarDate | null
  editing: Contact | null
  creating: boolean
  openCreate: () => void
  openEdit: (contact: Contact) => void
  closeForm: () => void
  saveContact: (input: ContactInput) => Promise<ApiResult<Contact>>
  removeContact: (id: string) => Promise<ApiResult<null>>
  saveSettings: (patch: Partial<Settings>) => Promise<ApiResult<Settings>>
  reloadContacts: () => Promise<void>
  search: string
  setSearch: (value: string) => void
  snooze: TodaySnoozeRequest | null
  closeSnooze: () => Promise<void>
  saveSnooze: (remindTime: string) => Promise<ApiResult<null>>
}

const AppStateContext = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [ready, setReady] = useState(false)
  const [fatalError, setFatalError] = useState<string | null>(null)
  const [page, setPage] = useState<PageId>('dashboard')
  const [today, setToday] = useState(() => toCalendarDate(new Date()))
  const [calendarFocus, setCalendarFocus] = useState<CalendarDate | null>(null)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [creating, setCreating] = useState(false)
  const [version, setVersion] = useState('0.1.0')
  const [search, setSearch] = useState('')
  const [snooze, setSnooze] = useState<TodaySnoozeRequest | null>(null)

  const load = useCallback(async () => {
    if (!window.birthdayly) {
      setFatalError('Birthdayly desktop bridge is unavailable.')
      return
    }
    const [settingsResult, contactsResult, versionResult] = await Promise.all([
      window.birthdayly.settings.get(),
      window.birthdayly.contacts.list(),
      window.birthdayly.app.version()
    ])
    if (!settingsResult.ok || !contactsResult.ok) {
      setFatalError(messages(DEFAULT_SETTINGS.language).toast.error)
      return
    }
    setSettings(settingsResult.data)
    setContacts(contactsResult.data)
    if (versionResult.ok) setVersion(versionResult.data)
    setReady(true)
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => setToday(toCalendarDate(new Date())), 60_000)
    const stopSnooze = window.birthdayly?.notifications.onSnooze((request) => setSnooze(request))
    return () => {
      window.clearInterval(timer)
      stopSnooze?.()
    }
  }, [load])

  const closeSnooze = useCallback(async () => {
    const current = snooze
    setSnooze(null)
    if (!current || !window.birthdayly) return
    await window.birthdayly.notifications.dismissToday(current)
  }, [snooze])

  const saveSnooze = useCallback(
    async (remindTime: string) => {
      if (!snooze || !window.birthdayly) return { ok: false as const, error: 'invalid' }
      const result = await window.birthdayly.notifications.snoozeToday({ ...snooze, remindTime })
      if (result.ok) setSnooze(null)
      return result
    },
    [snooze]
  )

  const reloadContacts = useCallback(async () => {
    const result = await window.birthdayly.contacts.list()
    if (result.ok) setContacts(result.data)
  }, [])

  const saveContact = useCallback(
    async (input: ContactInput) => {
      const result = editing
        ? await window.birthdayly.contacts.update(editing.id, input)
        : await window.birthdayly.contacts.create(input)
      if (result.ok) {
        await reloadContacts()
        setEditing(null)
        setCreating(false)
      }
      return result
    },
    [editing, reloadContacts]
  )

  const removeContact = useCallback(
    async (id: string) => {
      const result = await window.birthdayly.contacts.remove(id)
      if (result.ok) await reloadContacts()
      return result
    },
    [reloadContacts]
  )

  const saveSettings = useCallback(async (patch: Partial<Settings>) => {
    const result = await window.birthdayly.settings.update(patch)
    if (result.ok) setSettings(result.data)
    return result
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      ready,
      fatalError,
      settings,
      contacts,
      page,
      today,
      version,
      setPage,
      openCalendar: (date) => {
        setCalendarFocus(date ?? toCalendarDate(new Date()))
        setPage('calendar')
      },
      calendarFocus,
      editing,
      creating,
      openCreate: () => {
        setEditing(null)
        setCreating(true)
      },
      openEdit: (contact) => {
        setCreating(false)
        setEditing(contact)
      },
      closeForm: () => {
        setEditing(null)
        setCreating(false)
      },
      saveContact,
      removeContact,
      saveSettings,
      reloadContacts,
      search,
      setSearch,
      snooze,
      closeSnooze,
      saveSnooze
    }),
    [
      ready,
      fatalError,
      settings,
      contacts,
      page,
      today,
      version,
      calendarFocus,
      editing,
      creating,
      saveContact,
      removeContact,
      saveSettings,
      reloadContacts,
      search,
      snooze,
      closeSnooze,
      saveSnooze
    ]
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext)
  if (!value) throw new Error('AppState is missing')
  return value
}

export function describeError(language: AppStateValue['settings']['language'], result: { error: string; fieldErrors?: { code: string }[] }): string {
  if (result.fieldErrors && result.fieldErrors.length > 0) {
    return result.fieldErrors.map((error) => errorText(language, error.code)).join(' ')
  }
  return errorText(language, result.error)
}
