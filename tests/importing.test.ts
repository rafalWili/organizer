import { describe, expect, it } from 'vitest'
import { parseCsv, toCsv } from '@shared/csv'
import { buildImportPreview } from '@shared/importing'
import { contactIdentity } from '@shared/names'

const row = {
  first_name: 'Anna',
  last_name: 'Nowak',
  birth_day: '20',
  birth_month: '10',
  birth_year: '1990',
  notes: 'Lubię, "tort"',
  remind_on_day: '1',
  remind_1: '0',
  remind_3: '1',
  remind_7: '0',
  remind_time: ''
}

describe('csv and import preview', () => {
  it('round-trips quotes and commas', () => {
    const parsed = parseCsv(toCsv([row]))
    expect(parsed.error).toBeUndefined()
    expect(parsed.rows[0]).toEqual(row)
  })

  it('rejects a missing header', () => {
    expect(parseCsv('name\nAnna\n').error).toBe('header')
  })

  it('marks duplicates and invalid rows before anything is written', () => {
    const existing = new Map<string, string>([
      [contactIdentity({ firstName: 'anna', lastName: 'nowak', birthMonth: 10, birthDay: 20 }), 'contact-1']
    ])
    const preview = buildImportPreview(
      [
        {
          firstName: 'Anna',
          lastName: 'Nowak',
          birthDay: 20,
          birthMonth: 10,
          birthYear: 1990,
          notes: null,
          reminders: { onDay: true, daysBefore1: false, daysBefore3: false, daysBefore7: false },
          avatarDataUrl: null
        },
        { firstName: '' },
        {
          firstName: 'Ola',
          lastName: null,
          birthDay: 1,
          birthMonth: 1,
          birthYear: null,
          notes: null,
          reminders: { onDay: true, daysBefore1: false, daysBefore3: false, daysBefore7: false },
          avatarDataUrl: null
        }
      ],
      existing,
      { year: 2026, month: 10, day: 20 }
    )
    expect(preview.duplicateCount).toBe(1)
    expect(preview.invalidCount).toBe(1)
    expect(preview.validCount).toBe(2)
    expect(preview.rows[0]?.duplicate).toBe(true)
    expect(preview.rows[2]?.duplicate).toBe(false)
  })
})
