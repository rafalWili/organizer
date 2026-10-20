import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import Database from 'better-sqlite3'

export function openDatabase(): Database.Database {
  const directory = app.getPath('userData')
  mkdirSync(directory, { recursive: true })
  const database = new Database(join(directory, 'birthdayly.db'))
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')
  return database
}
