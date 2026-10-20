import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { messages, errorText } from '@shared/i18n'
import { useAppState } from '@/contexts/AppState'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function laterTime(current: string): string {
  const soon = new Date(Date.now() + 60_000)
  const next = `${String(soon.getHours()).padStart(2, '0')}:${String(soon.getMinutes()).padStart(2, '0')}`
  return current > next ? current : next
}

export function SnoozeDialog() {
  const { snooze, closeSnooze, saveSnooze, settings } = useAppState()
  const copy = messages(settings.language)
  const [time, setTime] = useState(() => laterTime(snooze?.currentTime ?? ''))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  if (!snooze) return null

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await saveSnooze(time)
    setPending(false)
    if (!result.ok) {
      setError(errorText(settings.language, result.error))
      return
    }
    toast.success(copy.toast.snoozed)
  }

  return (
    <Dialog title={copy.form.snoozeTitle} onClose={() => void closeSnooze()}>
      <form onSubmit={(event) => void submit(event)} className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          {snooze.firstName}. {copy.form.snoozeBody}
        </p>
        <div className="grid gap-1.5 text-sm">
          <Label>{copy.form.reminderTime}</Label>
          <Input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => void closeSnooze()}>
            {copy.actions.cancel}
          </Button>
          <Button type="submit" disabled={pending}>
            {copy.form.snoozeSave}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
