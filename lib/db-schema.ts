import { promises as fs } from "fs"
import path from "path"
// Updated import: use the synchronous API from "csv-parse/sync"
import { parse } from "csv-parse/sync"

// SQL statements to create all tables (example)
const createTablesSQL = `
-- Offenders table (primary user/inmate table)
CREATE TABLE offenders (
  id SERIAL PRIMARY KEY,
  inmate_number VARCHAR(50) UNIQUE NOT NULL,
  nmcd_number VARCHAR(50),
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  status VARCHAR(20) NOT NULL, -- e.g., "active", "pending"
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
  custody_status VARCHAR(20) DEFAULT 'in_custody' -- e.g., "in_custody", "released"
);

-- Cases table
CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  court VARCHAR(100) NOT NULL,
  judge VARCHAR(100),
  filing_date DATE,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  case_type VARCHAR(50),  -- e.g., "Civil", "Criminal"
  plaintiff VARCHAR(100),
  defendant VARCHAR(100),
  status VARCHAR(20) NOT NULL,  -- e.g., "Active", "Dismissed"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_date TIMESTAMP
);

-- Charges table
CREATE TABLE charges (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  count_number INTEGER,
  statute VARCHAR(100),
  description TEXT,
  class VARCHAR(20),
  charge_date DATE,
  citation_number VARCHAR(50),
  plea VARCHAR(50),
  disposition VARCHAR(100),
  disposition_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hearings table
CREATE TABLE hearings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  hearing_date DATE,
  hearing_time VARCHAR(20),  -- stored as text (e.g., "8:30 AM")
  hearing_type VARCHAR(50),
  hearing_judge VARCHAR(100),
  court VARCHAR(100),
  court_room VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login Activity table
CREATE TABLE login_activity (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  activity_type VARCHAR(20) NOT NULL,  -- e.g., "login", "logout"
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offenses table
CREATE TABLE offenses (
  id SERIAL PRIMARY KEY,
  offender_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  offense_description TEXT,
  case_number VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
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

-- Configs table
CREATE TABLE configs (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motion Templates table (for AI-generated motion content)
CREATE TABLE motion_templates (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  variables TEXT[]  -- an array of variable names (e.g., ["defendant_name", "charges"])
);

-- Motion Filings table
CREATE TABLE motion_filings (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  content TEXT,
  filing_date DATE,
  status VARCHAR(50), -- e.g., "Denied", "Moot", etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES offenders(id) ON DELETE CASCADE,
  type VARCHAR(50),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

`

async function initializeDatabaseSchema() {
  try {
    // Example: read additional schema files if necessary
    const extraSchemaPath = path.join(process.cwd(), "schema", "extra-schema.csv")
    const extraSchemaContent = await fs.readFile(extraSchemaPath, "utf8")
    // Parse CSV if needed (assuming your CSV contains additional SQL commands)
    const records = parse(extraSchemaContent, {
      columns: true,
      skip_empty_lines: true,
    })
    console.log("Extra schema records:", records)

    // Execute the SQL statements using your database client, e.g.:
    // await query(createTablesSQL);
    console.log("Database schema initialized.")
  } catch (error) {
    console.error("Error initializing database schema:", error)
    throw error
  }
}

export { createTablesSQL, initializeDatabaseSchema }

