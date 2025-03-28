// lib/db-schema.ts
import { pool, query } from './db';
import fs from 'fs/promises';
import path from 'path';
import csvParse from 'csv-parse/lib/sync';

// SQL statements to create all tables
const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Offenders table
CREATE TABLE IF NOT EXISTS offenders (
  id SERIAL PRIMARY KEY,
  inmate_number TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT,
  facility TEXT,
  mugshot_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  case_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Charges table
CREATE TABLE IF NOT EXISTS charges (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  charge TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Hearings table
CREATE TABLE IF NOT EXISTS hearings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  hearing_date TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Motions table
CREATE TABLE IF NOT EXISTS motions (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  motion_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  type TEXT,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Past Offenses table
CREATE TABLE IF NOT EXISTS past_offenses (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  offense TEXT,
  status TEXT,
  occurred_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  reminder_text TEXT,
  remind_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

/**
 * Resets the database by dropping all tables and recreating them.
 */
export async function resetDatabase(): Promise<{ success: boolean; error?: string }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Drop tables in reverse dependency order; CASCADE ensures dependent objects are removed.
    await client.query('DROP TABLE IF EXISTS notifications, reminders, motions, hearings, charges, cases, past_offenses, settings, offenders, users CASCADE');
    // Create tables using the defined schema
    await client.query(createTablesSQL);
    await client.query('COMMIT');
    return { success: true };
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error resetting database:', err);
    return { success: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * Helper function to seed a table from a CSV file.
 * @param tableName - The name of the table to seed.
 * @param csvFileName - The CSV file name located in the "seed-data" folder.
 * @param columns - An array of column names that match the CSV headers.
 */
async function seedTableFromCSV(tableName: string, csvFileName: string, columns: string[]): Promise<void> {
  const filePath = path.join(process.cwd(), 'seed-data', csvFileName);
  const fileContent = await fs.readFile(filePath, 'utf8');
  const records = csvParse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });
  if (records.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const record of records) {
      const colNames = columns.join(', ');
      const colPlaceholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const values = columns.map((col) => record[col]);
      const sql = `INSERT INTO ${tableName} (${colNames}) VALUES (${colPlaceholders})`;
      await client.query(sql, values);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error seeding table ${tableName}:`, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Seeds the database with initial data from CSV files.
 */
export async function seedDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    // Seed Users
    await seedTableFromCSV('users', 'users.csv', ['username', 'email']);
    // Seed Offenders
    await seedTableFromCSV('offenders', 'offenders.csv', ['inmate_number', 'first_name', 'last_name', 'status', 'facility', 'mugshot_url']);
    // Seed Cases
    await seedTableFromCSV('cases', 'cases.csv', ['offender_id', 'case_text']);
    // Seed Charges
    await seedTableFromCSV('charges', 'charges.csv', ['case_id', 'charge', 'status']);
    // Seed Hearings
    await seedTableFromCSV('hearings', 'hearings.csv', ['case_id', 'hearing_date', 'description']);
    // Seed Motions
    await seedTableFromCSV('motions', 'motions.csv', ['case_id', 'motion_text']);
    // Seed Notifications
    await seedTableFromCSV('notifications', 'notifications.csv', ['offender_id', 'type', 'message', 'read']);
    // Seed Past Offenses
    await seedTableFromCSV('past_offenses', 'past_offenses.csv', ['offender_id', 'offense', 'status', 'occurred_at']);
    // Seed Reminders
    await seedTableFromCSV('reminders', 'reminders.csv', ['offender_id', 'reminder_text', 'remind_at']);
    // Seed Settings
    await seedTableFromCSV('settings', 'settings.csv', ['key', 'value', 'description']);
    return { success: true };
  } catch (err: any) {
    console.error('Error seeding database:', err);
    return { success: false, error: err.message };
  }
}
