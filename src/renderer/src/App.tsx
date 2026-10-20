import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { messages } from '@shared/i18n'
import { useAppState } from '@/contexts/AppState'
import { AppShell } from '@/components/layout/AppShell'
import { ContactFormDialog } from '@/components/contacts/ContactFormDialog'
import { SnoozeDialog } from '@/components/contacts/SnoozeDialog'
import { DashboardPage } from '@/pages/DashboardPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { ContactsPage } from '@/pages/ContactsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export function App() {
  const { ready, fatalError, page, settings, creating, editing, snooze } = useAppState()
  const copy = messages(settings.language)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && media.matches)
      root.classList.toggle('dark', dark)
      root.lang = settings.language === 'en' ? 'en' : 'pl'
    }
    apply()
    if (settings.theme !== 'system') return
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [settings.language, settings.theme])

  if (fatalError) {
    return <div className="grid h-full place-items-center p-8 text-sm">{fatalError}</div>
  }
  if (!ready) {
    return <div className="grid h-full place-items-center text-sm text-muted-foreground">{copy.loading}</div>
  }

  return (
    <>
      <AppShell>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'calendar' && <CalendarPage />}
        {page === 'contacts' && <ContactsPage />}
        {page === 'settings' && <SettingsPage />}
      </AppShell>
      {(creating || editing) && <ContactFormDialog />}
      {snooze && <SnoozeDialog key={`${snooze.contactId}:${snooze.reminderType}:${snooze.occurrenceYear}`} />}
      <Toaster
        theme={settings.theme === 'system' ? 'system' : settings.theme}
        position="bottom-right"
        toastOptions={{ duration: 2800 }}
      />
    </>
  )
}
