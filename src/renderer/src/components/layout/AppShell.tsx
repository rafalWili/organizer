import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Plus, Search } from 'lucide-react'
import { displayName } from '@shared/names'
import { messages } from '@shared/i18n'
import { useAppState } from '@/contexts/AppState'
import { look } from '@/lib/look'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/contacts/Avatar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full bg-[#e7e3f6] p-3 dark:bg-[#0c0c12]">
      <div className="flex h-full overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_70px_rgb(88_70_150/0.12)] dark:border-border dark:bg-card">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-auto px-6 py-5 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}

function TopBar() {
  const { search, setSearch, contacts, settings, openCreate, openEdit, page, setPage } = useAppState()
  const visual = look(settings.language)
  const copy = messages(settings.language)
  const inputRef = useRef<HTMLInputElement>(null)
  const matches = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase(settings.language === 'en' ? 'en' : 'pl')
    if (!needle) return []
    return contacts
      .filter((contact) => `${displayName(contact)} ${contact.notes ?? ''}`.toLocaleLowerCase(settings.language === 'en' ? 'en' : 'pl').includes(needle))
      .slice(0, 6)
  }, [contacts, search, settings.language])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="flex items-center gap-3 px-6 pt-5 lg:px-8">
      <div className="relative min-w-0 flex-1">
        <label className="flex h-11 items-center gap-2 rounded-full border border-border bg-[#faf9fd] px-4 text-sm dark:bg-muted">
          <Search size={16} className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              if (page !== 'contacts' && event.target.value.trim()) setPage('contacts')
            }}
            placeholder={visual.search}
            aria-label={copy.contacts.search}
            className="w-full bg-transparent outline-none"
          />
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">Ctrl K</kbd>
        </label>
        {matches.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            {matches.map((contact) => (
              <li key={contact.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    openEdit(contact)
                    setSearch('')
                  }}
                >
                  <Avatar contact={contact} size={28} />
                  {displayName(contact)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button onClick={openCreate}>
        <Plus size={16} />
        {page === 'contacts' ? visual.addContact : copy.actions.add}
      </Button>
    </header>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5">
      <h1 className="text-[1.7rem] font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  )
}
