import { describe, expect, it } from 'vitest'
import { validateContactInput, validateSettingsPatch } from '@shared/validation'

const today = { year: 2026, month: 10, day: 20 }

const valid = {
  firstName: ' Anna ',
  lastName: '',
  birthDay: 2,
  birthMonth: 5,
  birthYear: 1991,
  notes: '  ',
  reminders: { onDay: true, daysBefore1: false, daysBefore3: true, daysBefore7: false },
  avatarDataUrl: null,
  removeAvatar: false
}

describe('validation', () => {
  it('trims names and accepts a birthday without a year', () => {
    const result = validateContactInput({ ...valid, birthYear: null }, today)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.firstName).toBe('Anna')
      expect(result.value.lastName).toBeNull()
      expect(result.value.notes).toBeNull()
    }
  })

  it('rejects an empty name, an impossible day, and a future birth', () => {
    expect(validateContactInput({ ...valid, firstName: '  ' }, today).ok).toBe(false)
    expect(validateContactInput({ ...valid, birthMonth: 2, birthDay: 31 }, today).ok).toBe(false)
    expect(validateContactInput({ ...valid, birthYear: 2026, birthMonth: 12, birthDay: 1 }, today).ok).toBe(false)
  })

  it('rejects February 29 in a non-leap birth year', () => {
    const result = validateContactInput({ ...valid, birthMonth: 2, birthDay: 29, birthYear: 2025 }, today)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.some((error) => error.code === 'feb29Year')).toBe(true)
  })

  it('accepts a partial settings patch and rejects a bad reminder time', () => {
    const ok = validateSettingsPatch({ theme: 'dark', gracePeriodHours: 36 })
    expect(ok.ok).toBe(true)
    expect(validateSettingsPatch({ reminderTime: '25:00' }).ok).toBe(false)
    expect(validateSettingsPatch({ gracePeriodHours: 0 }).ok).toBe(false)
  })
})
