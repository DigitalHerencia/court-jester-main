// lib/db/db-schema.ts

// Updated import: use the synchronous API from "csv-parse/sync"
import { query } from "./db";

// SQL statements to create all tables (example)
const createTablesSQL = `
CREATE TABLE offenders (
  id SERIAL PRIMARY KEY,
  inmate_number VARCHAR(50) UNIQUE NOT NULL,
  nmcd_number VARCHAR(50),
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  facility VARCHAR(100),
  age INTEGER,
  height VARCHAR(50),
  weight INTEGER,
  eye_color VARCHAR(50),
  hair VARCHAR(50),
  religion VARCHAR(50),
  education VARCHAR(100),
  complexion VARCHAR(50),
  ethnicity VARCHAR(50),
  alias VARCHAR(100),
  mugshot_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  account_enabled BOOLEAN DEFAULT TRUE,
  profile_enabled BOOLEAN DEFAULT TRUE,
  custody_status VARCHAR(20) DEFAULT 'in_custody'
);

CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(100) UNIQUE NOT NULL,
  court VARCHAR(100) NOT NULL,
  judge VARCHAR(100),
  filing_date DATE,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  case_type VARCHAR(50),
  plaintiff VARCHAR(100),
  defendant VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_date TIMESTAMP
);

CREATE TABLE charges (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  count_number INTEGER NOT NULL DEFAULT 1,
  statute VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  class VARCHAR(50),
  charge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  citation_number VARCHAR(50) NOT NULL DEFAULT '',
  plea VARCHAR(50) NOT NULL DEFAULT 'Not Entered',
  disposition VARCHAR(100),
  disposition_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hearings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  hearing_date DATE NOT NULL,
  hearing_time VARCHAR(50) NOT NULL DEFAULT '00:00',
  hearing_type VARCHAR(50) NOT NULL DEFAULT 'Status',
  hearing_judge VARCHAR(100),
  court VARCHAR(100) NOT NULL,
  court_room VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'Scheduled'
);

CREATE TABLE login_activity (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  activity_type VARCHAR(20) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offenses (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  offense_description TEXT,
  case_number VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(100),
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE motion_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  variables TEXT[]
);

CREATE TABLE motion_filings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  content TEXT,
  filing_date DATE,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  type VARCHAR(50),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

// Add notification-related tables
const notificationTablesSQL = `
-- Table for storing hearing notification settings
CREATE TABLE IF NOT EXISTS hearing_notifications (
  id SERIAL PRIMARY KEY,
  hearing_id INTEGER REFERENCES hearings(id) ON DELETE CASCADE,
  notification_ids TEXT[], -- Array of browser notification IDs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(hearing_id)
);

-- Add notification tracking columns to motion_filings
ALTER TABLE motion_filings
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP;

-- Table for storing notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{
    "court_date": true,
    "motion_status": true,
    "system": true,
    "warning": true,
    "reminder": true
  }',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(offender_id)
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps
CREATE TRIGGER update_hearing_notifications_updated_at
  BEFORE UPDATE ON hearing_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

async function initializeDatabaseSchema() {
  try {
    await query(createTablesSQL)
    await query(notificationTablesSQL)
    console.log("Database schema initialized successfully")
  } catch (error) {
    console.error("Error initializing database schema:", error)
    throw error
  }
}

export { createTablesSQL, notificationTablesSQL, initializeDatabaseSchema }




