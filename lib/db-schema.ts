"use server"

import { query } from "./db"

export async function resetDatabase() {
  try {
    console.log("Dropping existing tables...")

    // Drop tables in reverse order of dependencies
    await query(`
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS reminders CASCADE;
      DROP TABLE IF EXISTS hearings CASCADE;
      DROP TABLE IF EXISTS charges CASCADE;
      DROP TABLE IF EXISTS motions CASCADE;
      DROP TABLE IF EXISTS cases CASCADE;
      DROP TABLE IF EXISTS past_offenses CASCADE;
      DROP TABLE IF EXISTS offenders CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS settings CASCADE;
    `)

    console.log("Creating new tables...")

    // Create users table
    await query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        offender_id INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create offenders table
    await query(`
      CREATE TABLE offenders (
        id SERIAL PRIMARY KEY,
        inmate_number VARCHAR(50) NOT NULL UNIQUE,
        nmcd_number VARCHAR(50),
        last_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        middle_name VARCHAR(100),
        status VARCHAR(50),
        facility VARCHAR(255),
        age INTEGER,
        height VARCHAR(50),
        weight INTEGER,
        eye_color VARCHAR(50),
        hair VARCHAR(50),
        religion VARCHAR(100),
        education VARCHAR(100),
        complexion VARCHAR(50),
        ethnicity VARCHAR(50),
        alias VARCHAR(255),
        mugshot_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create past_offenses table
    await query(`
      CREATE TABLE past_offenses (
        id SERIAL PRIMARY KEY,
        offender_id INTEGER NOT NULL REFERENCES offenders(id) ON DELETE CASCADE,
        offense_description TEXT NOT NULL,
        case_number VARCHAR(100),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create cases table
    await query(`
      CREATE TABLE cases (
        id SERIAL PRIMARY KEY,
        case_number VARCHAR(100) NOT NULL UNIQUE,
        court VARCHAR(255),
        judge VARCHAR(255),
        filing_date DATE,
        offender_id INTEGER NOT NULL REFERENCES offenders(id) ON DELETE CASCADE,
        case_type VARCHAR(50),
        plaintiff VARCHAR(255),
        defendant VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create charges table
    await query(`
      CREATE TABLE charges (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        count_number INTEGER,
        statute VARCHAR(100),
        description TEXT,
        class VARCHAR(50),
        charge_date DATE,
        citation_number VARCHAR(100),
        plea VARCHAR(50),
        disposition VARCHAR(100),
        disposition_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create hearings table
    await query(`
      CREATE TABLE hearings (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        hearing_date DATE,
        hearing_time VARCHAR(50),
        hearing_type VARCHAR(100),
        hearing_judge VARCHAR(255),
        court VARCHAR(255),
        court_room VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create motions table
    await query(`
      CREATE TABLE motions (
        id SERIAL PRIMARY KEY,
        case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        filing_date DATE,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create reminders table
    await query(`
      CREATE TABLE reminders (
        id SERIAL PRIMARY KEY,
        offender_id INTEGER NOT NULL REFERENCES offenders(id) ON DELETE CASCADE,
        case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create notifications table
    await query(`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create settings table
    await query(`
      CREATE TABLE settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Tables created successfully")

    return { success: true }
  } catch (error) {
    console.error("Error resetting database:", error)
    return { success: false, error }
  }
}

export async function seedDatabase() {
  try {
    console.log("Seeding database with initial data...")

    // Create admin user
    await query(`
      INSERT INTO users (username, password_hash, role)
      VALUES ('admin', '$2b$10$X7VYVy1GUERl.Uo/5z.YUOtZY0r5gZ5VnhWK5/5.I5jWXSEFyimYO', 'admin')
    `)

    // Create offender
    const offenderResult = await query(`
      INSERT INTO offenders (
        inmate_number, nmcd_number, last_name, first_name, middle_name,
        status, age, height, weight, eye_color, hair, ethnicity
      )
      VALUES (
        '468079', '', 'Dominguez', 'Christopher', 'Arthur',
        'INACTIVE', 42, '5 ft 10 in', 168, 'Brown', 'Brown or Dark Brown', 'Hispanic'
      )
      RETURNING id
    `)

    const offenderId = offenderResult.rows[0].id

    // Create offender user
    await query(
      `
      INSERT INTO users (username, password_hash, role, offender_id)
      VALUES ('468079', '$2b$10$X7VYVy1GUERl.Uo/5z.YUOtZY0r5gZ5VnhWK5/5.I5jWXSEFyimYO', 'offender', $1)
    `,
      [offenderId],
    )

    // Add past offenses
    await query(
      `
      INSERT INTO past_offenses (offender_id, offense_description, case_number, status)
      VALUES 
        ($1, 'Burglary (automobile) - conspiracy', 'D-0307-CR-2008-1281', 'Completed'),
        ($1, 'Burglary (automobile)', 'D-0307-CR-2008-1281', 'Completed')
    `,
      [offenderId],
    )

    // Create cases
    const case1Result = await query(
      `
      INSERT INTO cases (
        case_number, court, judge, filing_date, offender_id, 
        case_type, plaintiff, defendant, status
      )
      VALUES (
        'M-14-CV-202401496', 'LAS CRUCES Magistrate', 'Flores, Linda L.', '2024-09-23', $1,
        'Civil', 'Jose Melendez', 'Christopher Arthur Dominguez', 'Active'
      )
      RETURNING id
    `,
      [offenderId],
    )

    const case1Id = case1Result.rows[0].id

    const case2Result = await query(
      `
      INSERT INTO cases (
        case_number, court, judge, filing_date, offender_id, 
        case_type, plaintiff, defendant, status
      )
      VALUES (
        'M-15-MR-202400106', 'ANTHONY Magistrate', 'Gelecki, Bryan M', '2024-08-06', $1,
        'Criminal', 'State of New Mexico', 'Christopher Arthur Dominguez', 'Dismissed'
      )
      RETURNING id
    `,
      [offenderId],
    )

    const case2Id = case2Result.rows[0].id

    const case3Result = await query(
      `
      INSERT INTO cases (
        case_number, court, judge, filing_date, offender_id, 
        case_type, plaintiff, defendant, status
      )
      VALUES (
        'M-14-DR-202400592', 'LAS CRUCES Magistrate', 'Wingenroth, Kent L.', '2024-12-11', $1,
        'Criminal', 'State of New Mexico', 'Christopher Arthur Dominguez', 'Active'
      )
      RETURNING id
    `,
      [offenderId],
    )

    const case3Id = case3Result.rows[0].id

    // Add charges for case 2 (M-15-MR-202400106)
    await query(
      `
      INSERT INTO charges (
        case_id, count_number, statute, description, class,
        charge_date, citation_number, plea, disposition, disposition_date
      )
      VALUES
        ($1, 1, '31-2-26', 'Denying the Rights of an Election Challenger', 'PM', 
         '2024-05-18', '0710725739905', 'Not Guilty', 'Dismissed - Failure to Appear by Prosecutor', '2024-11-12'),
        ($1, 2, '66-3-18 & 66-8-116', 'Improper Display of Registration Plate', 'PM', 
         '2024-05-18', '0710725739897', 'Not Guilty', 'Dismissed - Failure to Appear by Prosecutor', '2024-11-12')
    `,
      [case2Id],
    )

    // Add charges for case 3 (M-14-DR-202400592)
    await query(
      `
      INSERT INTO charges (
        case_id, count_number, statute, description, class,
        charge_date, citation_number, plea
      )
      VALUES
        ($1, 1, '66-8-102(B)', 'DWI Driving While Under the Influence of Drugs (1st)', 'PM', 
         '2024-12-10', '0105293021', 'Not Guilty'),
        ($1, 2, '66-7-301', 'Speeding (Over by 1-10)', 'PM', 
         '2024-12-10', '0710725952854', 'Not Guilty'),
        ($1, 3, '66-5-229', 'No Proof of Insurance', 'PM', 
         '2024-12-10', '0710725952862', 'Not Guilty'),
        ($1, 4, '66-8-116 & 66-8-138', 'Open Container (Drink) (1st Offense)', 'PM', 
         '2024-12-10', '0710725952870', 'Not Guilty'),
        ($1, 5, '66-3-805 & 66-8-116', 'Improper Equipment - Failure to Have Operating Tail Lamps', 'PM', 
         '2024-12-10', '0710725952888', 'Not Guilty'),
        ($1, 6, '66-3-18 & 66-8-116', 'Improper Display of Registration Plate', 'PM', 
         '2024-12-10', '0710725952896', 'Not Guilty')
    `,
      [case3Id],
    )

    // Add hearings for case 1 (M-14-CV-202401496)
    await query(
      `
      INSERT INTO hearings (
        case_id, hearing_date, hearing_time, hearing_type, 
        hearing_judge, court, court_room
      )
      VALUES
        ($1, '2024-12-05', '8:30 AM', 'Motion Hearing', 
         'Flores, Linda L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR3)'),
        ($1, '2024-10-03', '8:30 AM', 'Restitution Trial', 
         'Flores, Linda L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR3)')
    `,
      [case1Id],
    )

    // Add hearings for case 2 (M-15-MR-202400106)
    await query(
      `
      INSERT INTO hearings (
        case_id, hearing_date, hearing_time, hearing_type, 
        hearing_judge, court, court_room
      )
      VALUES
        ($1, '2024-11-12', '1:30 PM', 'Pretrial Hearing', 
         'Gelecki, Bryan M', 'ANTHONY', 'Dona Ana County Magistrate Court in Anthony'),
        ($1, '2024-08-27', '9:00 AM', 'Arraignment', 
         'Gelecki, Bryan M', 'ANTHONY', 'Dona Ana County Magistrate Court in Anthony')
    `,
      [case2Id],
    )

    // Add hearings for case 3 (M-14-DR-202400592)
    await query(
      `
      INSERT INTO hearings (
        case_id, hearing_date, hearing_time, hearing_type, 
        hearing_judge, court, court_room
      )
      VALUES
        ($1, '2025-04-01', '1:30 PM', 'Pretrial Hearing', 
         'Wingenroth, Kent L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR4)'),
        ($1, '2025-02-17', '1:30 PM', 'Pretrial Hearing', 
         'Wingenroth, Kent L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR4)'),
        ($1, '2025-02-04', '1:30 PM', 'Pretrial Hearing', 
         'Wingenroth, Kent L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR4)'),
        ($1, '2024-12-11', '10:00 AM', 'Arraignment', 
         'Flores, Linda L.', 'LAS CRUCES', 'Dona Ana County Magistrate Court (CR3)')
    `,
      [case3Id],
    )

    // Add motions for case 1 (M-14-CV-202401496)
    await query(
      `
      INSERT INTO motions (
        case_id, title, content, filing_date, status
      )
      VALUES
        ($1, 'Motion for writ of replevin', 'Motion for writ of replevin', '2024-10-30', 'Denied'),
        ($1, 'Petition by resident for possession', 'Petition by resident for possession', '2024-10-22', 'Denied'),
        ($1, 'Motion to stay writ of restitution', 'Motion to stay writ of restitution', '2024-10-22', 'Denied'),
        ($1, 'Emergency Motion for return of personal Property', 'Emergency Motion for return of personal Property', '2024-10-22', 'Denied'),
        ($1, 'Motion for continuance', 'Motion for continuance', '2024-10-22', 'Moot')
    `,
      [case1Id],
    )

    // Add reminders
    await query(
      `
      INSERT INTO reminders (
        offender_id, case_id, title, description, due_date, is_completed
      )
      VALUES
        ($1, $2, 'Pretrial Hearing', 'Attend pretrial hearing for DWI case', '2025-04-01', false),
        ($1, $2, 'Meet with Attorney', 'Discuss DWI case with attorney', '2025-03-25', false),
        ($1, $2, 'Gather Evidence', 'Collect evidence for DWI defense', '2025-03-20', false)
    `,
      [offenderId, case3Id],
    )

    // Add notifications
    await query(`
      INSERT INTO notifications (
        user_id, type, message, read, created_at
      )
      VALUES
        (1, 'registration', 'New offender with inmate number 468079 has been registered.', false, '2025-03-22 11:54:49'),
        (1, 'hearing', 'A hearing has been scheduled for case M-14-DR-202400592.', false, '2025-03-21 11:54:49'),
        (1, 'motion', 'A motion has been filed for case M-14-CV-202401496.', false, '2025-03-20 11:54:49')
    `)

    // Add settings
    await query(`
      INSERT INTO settings (key, value, description)
      VALUES
        ('enable_notifications', 'true', 'Enable automatic notifications for new case events'),
        ('enable_motion_generation', 'false', 'Enable AI-assisted motion generation'),
        ('enable_case_search', 'true', 'Enable automatic case search and updates'),
        ('enable_calendar_sync', 'false', 'Enable synchronization with court calendars'),
        ('enable_data_backup', 'true', 'Enable automatic database backups')
    `)

    console.log("Database seeded successfully")

    return { success: true }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error }
  }
}

