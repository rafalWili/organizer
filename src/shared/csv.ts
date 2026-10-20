const CSV_HEADERS = [
  'first_name',
  'last_name',
  'birth_day',
  'birth_month',
  'birth_year',
  'notes',
  'remind_on_day',
  'remind_1',
  'remind_3',
  'remind_7',
  'remind_time'
] as const

const REQUIRED_HEADERS = CSV_HEADERS.filter((column) => column !== 'remind_time')

export interface CsvContactRow {
  first_name: string
  last_name: string
  birth_day: string
  birth_month: string
  birth_year: string
  notes: string
  remind_on_day: string
  remind_1: string
  remind_3: string
  remind_7: string
  remind_time: string
}

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

export function toCsv(rows: CsvContactRow[]): string {
  const lines = [CSV_HEADERS.join(',')]
  for (const row of rows) {
    lines.push(CSV_HEADERS.map((header) => escapeCell(row[header])).join(','))
  }
  return `${lines.join('\n')}\n`
}

export function parseCsv(text: string): { rows: CsvContactRow[]; error?: string } {
  const records = parseRecords(text)
  if (records.length === 0) return { rows: [], error: 'empty' }
  const header = records[0]
  if (!header) return { rows: [], error: 'empty' }
  const normalized = header.map((cell) => cell.trim().toLowerCase())
  const missing = REQUIRED_HEADERS.filter((column) => !normalized.includes(column))
  if (missing.length > 0) return { rows: [], error: 'header' }

  const indexes = new Map(normalized.map((column, index) => [column, index]))
  const rows: CsvContactRow[] = []
  for (const record of records.slice(1)) {
    if (record.every((cell) => cell.trim() === '')) continue
    const read = (column: (typeof CSV_HEADERS)[number]): string => {
      const index = indexes.get(column)
      if (index === undefined) return ''
      return record[index] ?? ''
    }
    rows.push({
      first_name: read('first_name'),
      last_name: read('last_name'),
      birth_day: read('birth_day'),
      birth_month: read('birth_month'),
      birth_year: read('birth_year'),
      notes: read('notes'),
      remind_on_day: read('remind_on_day'),
      remind_1: read('remind_1'),
      remind_3: read('remind_3'),
      remind_7: read('remind_7'),
      remind_time: read('remind_time')
    })
  }
  return { rows }
}

function parseRecords(text: string): string[][] {
  const records: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const source = text.replace(/^\uFEFF/, '')

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === undefined) break
    if (inQuotes) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }
    if (char === '"') {
      inQuotes = true
      continue
    }
    if (char === ',') {
      row.push(cell)
      cell = ''
      continue
    }
    if (char === '\n') {
      row.push(cell)
      records.push(row)
      row = []
      cell = ''
      continue
    }
    if (char !== '\r') cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    records.push(row)
  }
  return records
}
