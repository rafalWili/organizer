import { useState, type ReactNode } from 'react'
import { Bell, Cake, CalendarDays, Clock3, Download, Eye, Rocket, Settings2, SunMedium, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { upcomingBirthdays } from '@shared/birthdays'
import { draftsFromPreview } from '@shared/importing'
import { birthdayNotification } from '@shared/notificationsCopy'
import { fillTemplate, messages } from '@shared/i18n'
import { displayName } from '@shared/names'
import type { DuplicateAction, ImportPreview, ReminderPreferences } from '@shared/types'
import { describeError, useAppState } from '@/contexts/AppState'
import { look } from '@/lib/look'
import { PageHeader } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog } from '@/components/ui/dialog'

export function SettingsPage() {
  const { settings, saveSettings, version, reloadContacts, contacts, today } = useAppState()
  const copy = messages(settings.language)
  const visual = look(settings.language)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>('skip')
  const [busy, setBusy] = useState(false)
  const next = upcomingBirthdays(contacts, today, settings.feb29Behavior)[0]
  const sample = birthdayNotification(settings.language, 'on_day', next?.contact.firstName ?? 'Anna', next?.age ?? null)

  async function patch(nextPatch: Parameters<typeof saveSettings>[0]) {
    const result = await saveSettings(nextPatch)
    if (!result.ok) toast.error(describeError(settings.language, result))
  }

  function patchReminder(key: keyof ReminderPreferences, value: boolean) {
    void patch({ defaultReminders: { ...settings.defaultReminders, [key]: value } })
  }

  async function exportFile(kind: 'json' | 'csv') {
    const result = kind === 'json' ? await window.birthdayly.data.exportJson() : await window.birthdayly.data.exportCsv()
    if (!result.ok) {
      toast.error(describeError(settings.language, result))
      return
    }
    if (!result.data.canceled) toast.success(copy.toast.exported)
  }

  async function pickImport() {
    const result = await window.birthdayly.data.pickImport()
    if (!result.ok) {
      toast.error(describeError(settings.language, result))
      return
    }
    if (!result.data.canceled) setPreview(result.data.preview)
  }

  async function commitImport() {
    if (!preview) return
    setBusy(true)
    const result = await window.birthdayly.data.commitImport(draftsFromPreview(preview), duplicateAction)
    setBusy(false)
    if (!result.ok) {
      toast.error(describeError(settings.language, result))
      return
    }
    await reloadContacts()
    toast.success(`${copy.toast.imported} +${result.data.created} / ${result.data.merged}`)
    setPreview(null)
  }

  async function testNotification() {
    const result = await window.birthdayly.notifications.test()
    if (!result.ok) toast.error(describeError(settings.language, result))
    else toast.success(copy.toast.testSent)
  }

  return (
    <div>
      <PageHeader title={copy.settings.title} subtitle={copy.settings.subtitle} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <Card className="p-5">
          <SectionTitle icon={Bell} title={copy.settings.notifications} hint={copy.settings.notificationsHint} />
          <ToggleRow id="notifications-enabled" icon={Bell} tint="bg-violet-50 text-primary" label={copy.settings.enabled} hint={copy.settings.enabledHint}>
            <Switch labelledBy="notifications-enabled" checked={settings.notificationsEnabled} onCheckedChange={(notificationsEnabled) => void patch({ notificationsEnabled })} />
          </ToggleRow>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-1 py-2">
            <div>
              <div className="text-sm font-medium">{copy.settings.reminderTime}</div>
              <p className="text-xs text-muted-foreground">{copy.settings.reminderTimeHint}</p>
            </div>
            <Input className="w-32 rounded-full" type="time" value={settings.reminderTime} onChange={(event) => void patch({ reminderTime: event.target.value })} />
          </div>
          <ToggleRow id="remind-7" icon={CalendarDays} tint="bg-orange-50 text-orange-500" label={copy.form.sevenDays} hint={copy.settings.defaultReminders}>
            <Switch labelledBy="remind-7" checked={settings.defaultReminders.daysBefore7} onCheckedChange={(value) => patchReminder('daysBefore7', value)} />
          </ToggleRow>
          <ToggleRow id="remind-3" icon={CalendarDays} tint="bg-amber-50 text-amber-500" label={copy.form.threeDays} hint={copy.form.reminders}>
            <Switch labelledBy="remind-3" checked={settings.defaultReminders.daysBefore3} onCheckedChange={(value) => patchReminder('daysBefore3', value)} />
          </ToggleRow>
          <ToggleRow id="remind-1" icon={CalendarDays} tint="bg-yellow-50 text-yellow-600" label={copy.form.dayBefore} hint={copy.form.reminders}>
            <Switch labelledBy="remind-1" checked={settings.defaultReminders.daysBefore1} onCheckedChange={(value) => patchReminder('daysBefore1', value)} />
          </ToggleRow>
          <ToggleRow id="remind-0" icon={Cake} tint="bg-emerald-50 text-emerald-500" label={copy.form.onDay} hint={copy.form.reminders}>
            <Switch labelledBy="remind-0" checked={settings.defaultReminders.onDay} onCheckedChange={(value) => patchReminder('onDay', value)} />
          </ToggleRow>
          <ToggleRow id="auto-launch" icon={Rocket} tint="bg-violet-50 text-primary" label={copy.settings.autoLaunch} hint={copy.settings.autoLaunchHint}>
            <Switch labelledBy="auto-launch" checked={settings.autoLaunch} onCheckedChange={(autoLaunch) => void patch({ autoLaunch })} />
          </ToggleRow>
          <ToggleRow id="tray" icon={Settings2} tint="bg-slate-50 text-slate-500" label={copy.settings.tray} hint={copy.settings.trayHint}>
            <Switch labelledBy="tray" checked={settings.minimizeToTray} onCheckedChange={(minimizeToTray) => void patch({ minimizeToTray })} />
          </ToggleRow>
          <label className="mt-4 grid max-w-xs gap-1.5 text-sm">
            <Label>{copy.settings.grace}</Label>
            <Input
              className="rounded-full"
              type="number"
              min={1}
              max={168}
              value={settings.gracePeriodHours}
              onChange={(event) => {
                const gracePeriodHours = Number(event.target.value)
                if (Number.isInteger(gracePeriodHours)) void patch({ gracePeriodHours })
              }}
            />
            <span className="text-xs text-muted-foreground">{copy.settings.graceHint}</span>
          </label>
          <Button className="mt-4" variant="secondary" onClick={() => void testNotification()}>
            {copy.actions.testNotification}
          </Button>
        </Card>
        <div className="grid gap-4">
          <Card className="overflow-hidden p-5">
            <SectionTitle icon={Eye} title={visual.previewTitle} hint={visual.previewHint} />
            <div className="mt-4 rounded-3xl bg-gradient-to-br from-[#f4efff] via-[#f7f4ff] to-[#eef3ff] p-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{sample.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{next ? sample.body : visual.emptyPreview}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{settings.reminderTime}</span>
                </div>
                {next && <p className="mt-3 text-xs text-muted-foreground">{displayName(next.contact)}</p>}
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <SectionTitle icon={Settings2} title={visual.general} hint={copy.settings.appearanceHint} />
            <label className="mt-3 grid gap-1.5 text-sm">
              <Label>{copy.settings.language}</Label>
              <Select className="rounded-full" value={settings.language} onChange={(event) => void patch({ language: event.target.value as typeof settings.language })}>
                <option value="pl">{copy.settings.languagePl}</option>
                <option value="en">{copy.settings.languageEn}</option>
              </Select>
            </label>
            <label className="mt-3 grid gap-1.5 text-sm">
              <Label>{copy.settings.feb29}</Label>
              <Select className="rounded-full" value={settings.feb29Behavior} onChange={(event) => void patch({ feb29Behavior: event.target.value as typeof settings.feb29Behavior })}>
                <option value="feb28">{copy.settings.feb28}</option>
                <option value="mar1">{copy.settings.mar1}</option>
              </Select>
              <span className="text-xs text-muted-foreground">{copy.settings.feb29Hint}</span>
            </label>
          </Card>
          <Card className="p-5">
            <SectionTitle icon={SunMedium} title={visual.appearance} hint={copy.settings.appearanceHint} />
            <label className="mt-3 grid gap-1.5 text-sm">
              <Label>{copy.settings.theme}</Label>
              <Select className="rounded-full" value={settings.theme} onChange={(event) => void patch({ theme: event.target.value as typeof settings.theme })}>
                <option value="light">{copy.settings.themeLight}</option>
                <option value="dark">{copy.settings.themeDark}</option>
                <option value="system">{copy.settings.themeSystem}</option>
              </Select>
            </label>
            <p className="mt-3 text-xs text-muted-foreground">
              {copy.version} {version}
            </p>
          </Card>
        </div>
      </div>
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="flex items-center gap-2 font-medium">
            <Clock3 size={16} className="text-primary" />
            {visual.importExport}
          </div>
          <p className="text-xs text-muted-foreground">{copy.settings.dataHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void exportFile('json')}>
            <Download size={16} />
            {copy.actions.exportJson}
          </Button>
          <Button variant="secondary" onClick={() => void exportFile('csv')}>
            <Download size={16} />
            {copy.actions.exportCsv}
          </Button>
          <Button onClick={() => void pickImport()}>
            <Upload size={16} />
            {visual.importData}
          </Button>
        </div>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">{copy.settings.offlineHint}</p>
      {preview && (
        <Dialog wide title={copy.importPreview.title} onClose={() => setPreview(null)}>
          <p className="text-sm text-muted-foreground">
            {fillTemplate(copy.importPreview.summary, {
              valid: preview.validCount,
              duplicates: preview.duplicateCount,
              invalid: preview.invalidCount
            })}
          </p>
          {preview.rows.length === 0 ? (
            <p className="mt-4 text-sm">{copy.importPreview.empty}</p>
          ) : (
            <ul className="mt-4 max-h-72 space-y-2 overflow-auto">
              {preview.rows.map((row, index) => (
                <li key={`${row.label}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2 text-sm">
                  <span className="truncate">{row.label}</span>
                  <span className="text-muted-foreground">
                    {row.errors.length > 0 ? copy.importPreview.statusInvalid : row.duplicate ? copy.importPreview.statusDuplicate : copy.importPreview.statusOk}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <fieldset className="mt-4 grid gap-2 text-sm">
            <legend>{copy.importPreview.duplicateChoice}</legend>
            <label className="flex items-center gap-2">
              <input type="radio" name="duplicates" checked={duplicateAction === 'merge'} onChange={() => setDuplicateAction('merge')} />
              {copy.importPreview.merge}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="duplicates" checked={duplicateAction === 'skip'} onChange={() => setDuplicateAction('skip')} />
              {copy.importPreview.skip}
            </label>
          </fieldset>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPreview(null)}>
              {copy.actions.cancel}
            </Button>
            <Button disabled={busy || preview.validCount === 0} onClick={() => void commitImport()}>
              {copy.actions.confirmImport}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, hint }: { icon: typeof Bell; title: string; hint: string }) {
  return (
    <div className="mb-2">
      <h2 className="flex items-center gap-2 font-medium">
        <Icon size={16} className="text-primary" />
        {title}
      </h2>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function ToggleRow({
  id,
  icon: Icon,
  tint,
  label,
  hint,
  children
}: {
  id: string
  icon: typeof Bell
  tint: string
  label: string
  hint: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-3 first:border-t-0">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
          <Icon size={16} />
        </span>
        <div>
          <div id={id} className="text-sm font-medium">
            {label}
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
