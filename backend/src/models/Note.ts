import { Database } from 'sqlite3';

export interface CaseNote {
  id: string;
  patientId: string; // consistent naming
  date: string; // ISO date string
  time: string; // HH:mm format
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  attachments?: string; // JSON string to store array of filenames
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export class NoteModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initTable();
  }

  private initTable(): void {
    const sql = `
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
    `;
    this.db.run(sql, (err) => {
      if (err) {
        console.error('Error creating case_notes table:', err);
      } else {
        console.log('CaseNotes table ready');
      }
    });
  }

  async create(note: Omit<CaseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseNote> {
    return new Promise((resolve, reject) => {
      const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const sql = `
        INSERT INTO case_notes
        (id, patientId, date, time, doctor, diagnosis, prescription, notes, attachments, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        id,
        note.patientId,
        note.date,
        note.time,
        note.doctor,
        note.diagnosis,
        note.prescription,
        note.notes,
        note.attachments ? JSON.stringify(note.attachments) : null,
        note.status,
        now,
        now
      ];
      this.db.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve({
          id,
          ...note,
          attachments: note.attachments,
          createdAt: now,
          updatedAt: now
        });
      });
    });
  }

  async findById(id: string): Promise<CaseNote | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM case_notes WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        resolve({
          ...row,
          attachments: row.attachments ? JSON.parse(row.attachments) : []
        });
      });
    });
  }

  async findByPatientId(patientId: string): Promise<CaseNote[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM case_notes WHERE patientId = ? ORDER BY createdAt DESC';
      this.db.all(sql, [patientId], (err, rows) => {
        if (err) return reject(err);
        const notes = rows.map(row => ({
          ...row,
          attachments: row.attachments ? JSON.parse(row.attachments) : []
        }));
        resolve(notes);
      });
    });
  }

  async updateStatus(id: string, status: CaseNote['status']): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE case_notes SET status = ?, updatedAt = ? WHERE id = ?`;
      this.db.run(sql, [status, new Date().toISOString(), id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM case_notes WHERE id = ?';
      this.db.run(sql, [id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
