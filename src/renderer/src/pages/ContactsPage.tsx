import { useMemo, useState } from 'react'
import { Bell, MoreHorizontal } from 'lucide-react'
import { upcomingForContact } from '@shared/birthdays'
import { messages } from '@shared/i18n'
import { displayName } from '@shared/names'
import type { Contact, ContactSort } from '@shared/types'
import { useAppState } from '@/contexts/AppState'
import { daysText, formatCalendarDate } from '@/lib/format'
import { look } from '@/lib/look'
import { PageHeader } from '@/components/layout/AppShell'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/contacts/Avatar'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { WhenPill } from '@/pages/DashboardPage'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'

export function ContactsPage() {
  const { contacts, settings, today, search, openEdit, removeContact } = useAppState()
  const copy = messages(settings.language)
  const visual = look(settings.language)
  const [sort, setSort] = useState<ContactSort>('upcoming')
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState(false)

  const rows = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase(settings.language === 'en' ? 'en' : 'pl')
    const filtered = contacts.filter((contact) => {
      if (!needle) return true
      const haystack = `${displayName(contact)} ${contact.notes ?? ''}`.toLocaleLowerCase(settings.language === 'en' ? 'en' : 'pl')
      return haystack.includes(needle)
    })
    const decorated = filtered.map((contact) => ({
      contact,
      upcoming: upcomingForContact(contact, today, settings.feb29Behavior)
    }))
    decorated.sort((a, b) => {
      if (sort === 'name') return displayName(a.contact).localeCompare(displayName(b.contact), settings.language)
      if (sort === 'created') return b.contact.createdAt.localeCompare(a.contact.createdAt)
      if (a.upcoming.daysUntil !== b.upcoming.daysUntil) return a.upcoming.daysUntil - b.upcoming.daysUntil
      return displayName(a.contact).localeCompare(displayName(b.contact), settings.language)
    })
    return decorated
  }, [contacts, search, settings.feb29Behavior, settings.language, sort, today])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    const result = await removeContact(pendingDelete.id)
    setDeleting(false)
    if (!result.ok) {
      toast.error(copy.toast.error)
      return
    }
    toast.success(copy.toast.deleted)
    setPendingDelete(null)
  }

  return (
    <div>
      <PageHeader title={copy.contacts.title} subtitle={copy.contacts.subtitle} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          {copy.nav.contacts} {contacts.length}
        </div>
        <Select className="w-56 rounded-full" aria-label={copy.contacts.sort} value={sort} onChange={(event) => setSort(event.target.value as ContactSort)}>
          <option value="upcoming">{copy.contacts.sortUpcoming}</option>
          <option value="name">{copy.contacts.sortName}</option>
          <option value="created">{copy.contacts.sortCreated}</option>
        </Select>
      </div>
      {contacts.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">{copy.contacts.empty}</p>
      ) : rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-border p-8 text-sm text-muted-foreground">{copy.contacts.noResults}</p>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#faf9fd] text-left text-xs text-muted-foreground dark:bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium">{copy.nav.contacts}</th>
                <th className="px-4 py-3 font-medium">{copy.form.day}</th>
                <th className="px-4 py-3 font-medium">{copy.dashboard.daysLeft}</th>
                <th className="px-4 py-3 font-medium">{copy.form.reminders}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ contact, upcoming }, index) => {
                const reminded = contact.reminders.onDay || contact.reminders.daysBefore1 || contact.reminders.daysBefore3 || contact.reminders.daysBefore7
                return (
                  <tr key={contact.id} className={cn('border-t border-border', index === 0 && upcoming.daysUntil === 0 && 'bg-[#fbf8ff]')}>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => openEdit(contact)} className="flex items-center gap-3 text-left">
                        <Avatar contact={contact} size={36} />
                        <span>
                          <span className="block font-medium">{displayName(contact)}</span>
                          {contact.notes && <span className="text-xs text-muted-foreground">{contact.notes}</span>}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">{formatCalendarDate(upcoming.celebration, settings.language, 'd MMMM')}</td>
                    <td className="px-4 py-3">
                      <WhenPill days={upcoming.daysUntil} language={settings.language} todayLabel={visual.todayBang} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Bell size={14} className={reminded ? 'text-primary' : ''} />
                        {reminded ? `${daysText(settings.language, upcoming.daysUntil)} · ${contact.reminderTime ?? settings.reminderTime}` : visual.noReminder}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label={copy.actions.remove} onClick={() => setPendingDelete(contact)}>
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {pendingDelete && (
        <AlertDialog
          title={copy.contacts.deleteTitle}
          body={`${displayName(pendingDelete)}. ${copy.contacts.deleteBody}`}
          confirmLabel={copy.actions.remove}
          cancelLabel={copy.actions.cancel}
          pending={deleting}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  )
}
