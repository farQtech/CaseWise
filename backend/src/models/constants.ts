// ==================== FILE CONSTANTS ====================
export const FILE_TABLE = {
  NAME: 'files',
  CREATE_SQL: `
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      originalName TEXT NOT NULL,
      fileName TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileType TEXT NOT NULL,
      mimeType TEXT NOT NULL,
      size INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'uploaded',
      metadata TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients (id) ON DELETE CASCADE
    )
  `,
  SELECT_BY_ID: 'SELECT * FROM files WHERE id = ?',
  SELECT_BY_PATIENT: 'SELECT * FROM files WHERE patientId = ? ORDER BY createdAt DESC',
  SELECT_BY_STATUS: 'SELECT * FROM files WHERE status = ? ORDER BY createdAt ASC',
  DELETE_BY_ID: 'DELETE FROM files WHERE id = ?',
  DELETE_BY_PATIENT: 'DELETE FROM files WHERE patientId = ?',
  INSERT_SQL: `
    INSERT INTO files (id, patientId, originalName, fileName, filePath, fileType, mimeType, size, status, metadata, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  UPDATE_STATUS: `
    UPDATE files 
    SET status = ?, metadata = ?, updatedAt = ? 
    WHERE id = ?
  `
};

export const FILE_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  ERROR: 'error'
};

export const FILE_LOG = {
  TABLE_READY: 'Files table ready',
  ERROR_CREATE_TABLE: 'Error creating files table:',
  NOTIFY_WORKER: '📤 Notifying worker about',
  FAILED_NOTIFY_WORKER: 'Failed to notify worker:'
};

export const WORKER = {
  URL: process.env.WORKER_URL || 'http://localhost:3002'
};

// ==================== NOTE CONSTANTS ====================
export const NOTE_TABLE = {
  NAME: 'case_notes',
  CREATE_SQL: `
    CREATE TABLE IF NOT EXISTS case_notes (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      doctor TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      prescription TEXT NOT NULL,
      notes TEXT NOT NULL,
      attachments TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
    )
  `,
  INSERT_SQL: `
    INSERT INTO case_notes
    (id, patientId, date, time, doctor, diagnosis, prescription, notes, attachments, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  SELECT_BY_ID: 'SELECT * FROM case_notes WHERE id = ?',
  SELECT_BY_PATIENT: 'SELECT * FROM case_notes WHERE patientId = ? ORDER BY createdAt DESC',
  UPDATE_STATUS: 'UPDATE case_notes SET status = ?, updatedAt = ? WHERE id = ?',
  DELETE_BY_ID: 'DELETE FROM case_notes WHERE id = ?'
};

export const NOTE_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed'
};

export const NOTE_LOG = {
  TABLE_READY: 'CaseNotes table ready',
  ERROR_CREATE_TABLE: 'Error creating case_notes table:'
};

// ==================== USER CONSTANTS ====================
export const USER_TABLE = {
  NAME: 'users',
  INSERT: 'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
  SELECT_BY_EMAIL: 'SELECT * FROM users WHERE email = ?',
  SELECT_BY_ID: 'SELECT * FROM users WHERE id = ?'
};

export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user'
};

export const ADMIN_USER = {
  EMAIL: 'admin@casewise.com',
  PASSWORD: 'admin'
};

export const USER_LOG = {
  ADMIN_EXISTS: 'Admin user already exists',
  ADMIN_SEEDED: 'Admin user seeded successfully',
  ERROR_SEED_ADMIN: 'Error seeding admin user:'
};
