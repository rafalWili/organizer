import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { errorText, messages } from '@shared/i18n'
import { validateContactInput } from '@shared/validation'
import { daysInMonth } from '@shared/dates'
import type { ContactInput, FieldError, ReminderPreferences } from '@shared/types'
import { useAppState } from '@/contexts/AppState'
import { monthName } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const emptyReminders = (source: ReminderPreferences): ReminderPreferences => ({ ...source })

export function ContactFormDialog() {
  const { creating, editing, closeForm, saveContact, settings } = useAppState()
  const copy = messages(settings.language)
  const open = creating || editing != null
  if (!open) return null

  return (
    <Dialog drawer title={editing ? copy.form.editTitle : copy.form.createTitle} onClose={closeForm}>
      <ContactForm
        key={editing?.id ?? 'new'}
        initial={editing}
        onClose={closeForm}
        onSave={saveContact}
      />
    </Dialog>
  )
}

function ContactForm({
  initial,
  onClose,
  onSave
}: {
  initial: {
    firstName: string
    lastName: string | null
    birthDay: number
    birthMonth: number
    birthYear: number | null
    notes: string | null
    reminders: ReminderPreferences
    reminderTime: string | null
    avatarUrl: string | null
  } | null
  onClose: () => void
  onSave: (input: ContactInput) => Promise<{ ok: boolean; error?: string; fieldErrors?: FieldError[] }>
}) {
  const { settings } = useAppState()
  const copy = messages(settings.language)
  const [firstName, setFirstName] = useState(initial?.firstName ?? '')
  const [lastName, setLastName] = useState(initial?.lastName ?? '')
  const [birthMonth, setBirthMonth] = useState(initial?.birthMonth ?? new Date().getMonth() + 1)
  const [birthDay, setBirthDay] = useState(initial?.birthDay ?? new Date().getDate())
  const [birthYear, setBirthYear] = useState(initial?.birthYear ? String(initial.birthYear) : '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [reminders, setReminders] = useState<ReminderPreferences>(
    initial?.reminders ?? emptyReminders(settings.defaultReminders)
  )
  const [ownTime, setOwnTime] = useState(initial?.reminderTime != null)
  const [reminderTime, setReminderTime] = useState(initial?.reminderTime ?? settings.reminderTime)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [errors, setErrors] = useState<FieldError[]>([])
  const [pending, setPending] = useState(false)

  const maxDay = birthMonth === 2 ? 29 : daysInMonth(2024, birthMonth)
  const preview = removeAvatar ? null : avatarDataUrl ?? initial?.avatarUrl ?? null
  const errorMap = useMemo(() => new Map(errors.map((error) => [error.field, error.code])), [errors])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const year = birthYear.trim() === '' ? null : Number(birthYear)
    const input: ContactInput = {
      firstName,
      lastName,
      birthDay,
      birthMonth,
      birthYear: year != null && Number.isInteger(year) ? year : birthYear.trim() === '' ? null : Number.NaN,
      notes,
      reminders,
      reminderTime: ownTime ? reminderTime : null,
      avatarDataUrl,
      removeAvatar
    }
    const validated = validateContactInput(
      { ...input, birthYear: birthYear.trim() === '' ? null : Number(birthYear) },
      { year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate() }
    )
    if (!validated.ok) {
      setErrors(validated.errors)
      return
    }
    setPending(true)
    const result = await onSave(validated.value)
    setPending(false)
    if (!result.ok) {
      setErrors(result.fieldErrors ?? [{ field: 'contact', code: result.error ?? 'invalid' }])
      return
    }
    toast.success(copy.toast.saved)
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3">
      {errors.length > 0 && (
        <p className="rounded-xl bg-accent px-3 py-2 text-sm text-destructive" role="alert">
          {errors.map((error) => errorText(settings.language, error.code)).join(' ')}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={copy.form.firstName} error={errorMap.get('firstName')} language={settings.language}>
          <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} required maxLength={80} />
        </Field>
        <Field label={copy.form.lastName} error={errorMap.get('lastName')} language={settings.language}>
          <Input value={lastName} onChange={(event) => setLastName(event.target.value)} maxLength={80} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={copy.form.month} error={errorMap.get('birthday')} language={settings.language}>
          <Select
            value={birthMonth}
            onChange={(event) => {
              const month = Number(event.target.value)
              setBirthMonth(month)
              const limit = month === 2 ? 29 : daysInMonth(2024, month)
              setBirthDay((day) => Math.min(day, limit))
            }}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {monthName(index + 1, settings.language)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={copy.form.day} language={settings.language}>
          <Select value={birthDay} onChange={(event) => setBirthDay(Number(event.target.value))}>
            {Array.from({ length: maxDay }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={copy.form.year} error={errorMap.get('birthYear')} language={settings.language}>
          <Input
            inputMode="numeric"
            value={birthYear}
            placeholder={copy.form.yearHint}
            onChange={(event) => setBirthYear(event.target.value)}
          />
        </Field>
      </div>
      <Field label={copy.form.notes} error={errorMap.get('notes')} language={settings.language}>
        <Textarea value={notes} maxLength={2000} onChange={(event) => setNotes(event.target.value)} />
      </Field>
      <Field label={copy.form.avatar} error={errorMap.get('avatar')} language={settings.language}>
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => {
              setAvatarDataUrl(typeof reader.result === 'string' ? reader.result : null)
              setRemoveAvatar(false)
            }
            reader.readAsDataURL(file)
          }}
        />
        <p className="text-xs text-muted-foreground">{copy.form.avatarHint}</p>
        {preview && <img src={preview} alt="" className="h-14 w-14 rounded-full object-cover" />}
        {(initial?.avatarUrl || avatarDataUrl) && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={removeAvatar}
              onChange={(event) => setRemoveAvatar(event.target.checked)}
            />
            {copy.form.removeAvatar}
          </label>
        )}
      </Field>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">{copy.form.reminders}</legend>
        <ReminderToggle label={copy.form.onDay} checked={reminders.onDay} onChange={(onDay) => setReminders({ ...reminders, onDay })} />
        <ReminderToggle label={copy.form.dayBefore} checked={reminders.daysBefore1} onChange={(daysBefore1) => setReminders({ ...reminders, daysBefore1 })} />
        <ReminderToggle label={copy.form.threeDays} checked={reminders.daysBefore3} onChange={(daysBefore3) => setReminders({ ...reminders, daysBefore3 })} />
        <ReminderToggle label={copy.form.sevenDays} checked={reminders.daysBefore7} onChange={(daysBefore7) => setReminders({ ...reminders, daysBefore7 })} />
      </fieldset>
      <div className="grid gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ownTime} onChange={(event) => setOwnTime(event.target.checked)} />
          {copy.form.ownTime}
        </label>
        {ownTime ? (
          <Field label={copy.form.reminderTime} error={errorMap.get('reminderTime')} language={settings.language}>
            <Input type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} required />
          </Field>
        ) : (
          <p className="text-xs text-muted-foreground">
            {copy.form.inheritedTime}: {settings.reminderTime}. {copy.form.reminderTimeHint}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          {copy.actions.cancel}
        </Button>
        <Button type="submit" disabled={pending}>
          {copy.actions.save}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  error,
  language,
  children
}: {
  label: string
  error?: string
  language: 'pl' | 'en'
  children: ReactNode
}) {
  return (
    <div className="grid gap-1.5 text-sm">
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs text-destructive">{errorText(language, error)}</span>}
    </div>
  )
}

function ReminderToggle({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}
