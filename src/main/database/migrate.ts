import type Database from 'better-sqlite3'

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE contacts (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT,
        birth_day INTEGER NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
        birth_month INTEGER NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
        birth_year INTEGER,
        avatar_path TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE reminder_preferences (
        contact_id TEXT PRIMARY KEY,
        on_day INTEGER NOT NULL DEFAULT 1 CHECK (on_day IN (0, 1)),
        days_before_1 INTEGER NOT NULL DEFAULT 0 CHECK (days_before_1 IN (0, 1)),
        days_before_3 INTEGER NOT NULL DEFAULT 0 CHECK (days_before_3 IN (0, 1)),
        days_before_7 INTEGER NOT NULL DEFAULT 0 CHECK (days_before_7 IN (0, 1)),
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE notification_history (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        occurrence_year INTEGER NOT NULL,
        delivered_at TEXT NOT NULL,
        UNIQUE (contact_id, reminder_type, occurrence_year),
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      );

      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `
  },
  {
    version: 2,
    sql: `
      ALTER TABLE notification_history ADD COLUMN acknowledged_at TEXT;
    `
  },
  {
    version: 3,
    sql: `
      ALTER TABLE reminder_preferences ADD COLUMN reminder_time TEXT;

      CREATE TABLE reminder_overrides (
        contact_id TEXT NOT NULL,
        reminder_type TEXT NOT NULL,
        occurrence_year INTEGER NOT NULL,
        remind_time TEXT NOT NULL,
        PRIMARY KEY (contact_id, reminder_type, occurrence_year),
        FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
      );
    `
  }
]

export function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `)
  const current = database.prepare('SELECT MAX(version) AS version FROM schema_migrations').get() as {
    version: number | null
  }
  const applied = current.version ?? 0
  const mark = database.prepare('INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)')

  for (const migration of MIGRATIONS) {
    if (migration.version <= applied) continue
    const run = database.transaction(() => {
      database.exec(migration.sql)
      mark.run(migration.version, new Date().toISOString())
    })
    run()
  }
}
