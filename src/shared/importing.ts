import { contactIdentity, displayName } from './names'
import type { CalendarDate, ImportContactDraft, ImportPreview, ImportPreviewRow } from './types'
import { validateImportDraft } from './validation'

export function buildImportPreview(
  candidates: unknown[],
  existingIdentities: ReadonlyMap<string, string>,
  today: CalendarDate
): ImportPreview {
  const seen = new Set<string>()
  const rows: ImportPreviewRow[] = []
  let validCount = 0
  let invalidCount = 0
  let duplicateCount = 0

  candidates.forEach((candidate, index) => {
    const validated = validateImportDraft(candidate, today)
    if (!validated.ok) {
      invalidCount += 1
      rows.push({
        label: labelFromUnknown(candidate, index),
        draft: null,
        errors: validated.errors,
        duplicate: false
      })
      return
    }
    const identity = contactIdentity(validated.value)
    const duplicate = existingIdentities.has(identity) || seen.has(identity)
    seen.add(identity)
    if (duplicate) duplicateCount += 1
    validCount += 1
    rows.push({
      label: displayName(validated.value),
      draft: validated.value,
      errors: [],
      duplicate
    })
  })

  return { rows, validCount, invalidCount, duplicateCount }
}

function labelFromUnknown(candidate: unknown, index: number): string {
  if (typeof candidate === 'object' && candidate !== null && 'firstName' in candidate) {
    const name = (candidate as { firstName?: unknown }).firstName
    if (typeof name === 'string' && name.trim()) return name.trim()
  }
  return `#${index + 1}`
}

export function draftsFromPreview(preview: ImportPreview): ImportContactDraft[] {
  return preview.rows.flatMap((row) => (row.draft && row.errors.length === 0 ? [row.draft] : []))
}
