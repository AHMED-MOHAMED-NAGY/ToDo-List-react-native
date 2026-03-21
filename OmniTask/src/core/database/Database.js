/**
 * OmniTask - Database Configuration
 * SQLite database initialization and connection management
 */
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(false);

const DATABASE_NAME = 'OmniTask.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'OmniTask Local Database';
const DATABASE_SIZE = 200000;

let db = null;

/**
 * Opens or creates the SQLite database
 */
export const getDatabase = async () => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });
  return db;
};

/**
 * Initializes all database tables
 * Called once on app startup
 */
export const initDatabase = async () => {
  const database = await getDatabase();

  // ──────────────────────────────────────────────
  // TASKS TABLE - Core task entity
  // ──────────────────────────────────────────────
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('pending', 'in_progress', 'done', 'cancelled')) DEFAULT 'pending',
      recurrence TEXT CHECK(recurrence IN ('none', 'daily', 'weekly')) DEFAULT 'none',
      recurrence_days TEXT DEFAULT '',
      due_date TEXT DEFAULT NULL,
      due_time TEXT DEFAULT NULL,
      reminder_time TEXT DEFAULT NULL,
      calendar_event_id TEXT DEFAULT NULL,
      last_completed_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // ──────────────────────────────────────────────
  // MEDIA_ATTACHMENTS TABLE - Photos, videos, voice, screenshots
  // ──────────────────────────────────────────────
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS media_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('photo', 'video', 'voice', 'screenshot')) NOT NULL,
      file_uri TEXT NOT NULL,
      file_name TEXT DEFAULT '',
      file_size INTEGER DEFAULT 0,
      duration INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // ──────────────────────────────────────────────
  // DEEP_LINKS TABLE - Links to external apps/actions
  // ──────────────────────────────────────────────
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS deep_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      link_type TEXT CHECK(link_type IN (
        'whatsapp', 'telegram', 'contact', 'google_search',
        'samsung_notes', 'samsung_calendar', 'custom_url'
      )) NOT NULL,
      link_uri TEXT NOT NULL,
      display_label TEXT DEFAULT '',
      extra_data TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // ──────────────────────────────────────────────
  // APP_SETTINGS TABLE - Theme, floating widget prefs
  // ──────────────────────────────────────────────
  await database.executeSql(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if not present
  await database.executeSql(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('theme', 'dark');
  `);
  await database.executeSql(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('floating_widget_enabled', 'true');
  `);
  await database.executeSql(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('show_on_unlock', 'true');
  `);

  console.log('[OmniTask] Database initialized successfully');
  return database;
};

/**
 * Closes the database connection
 */
export const closeDatabase = async () => {
  if (db) {
    await db.close();
    db = null;
    console.log('[OmniTask] Database closed');
  }
};

export default {
  getDatabase,
  initDatabase,
  closeDatabase,
};
