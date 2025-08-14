import { Database } from 'sqlite3';
import { NOTE_TABLE, NOTE_STATUS, NOTE_LOG } from './constants';

export interface CaseNote {
  id: string;
  patientId: string;
  date: string;
  time: string;
  doctor: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  attachments?: string; // JSON string for array of filenames
  status: keyof typeof NOTE_STATUS;
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
    this.db.run(NOTE_TABLE.CREATE_SQL, (err) => {
      if (err) {
        console.error(NOTE_LOG.ERROR_CREATE_TABLE, err);
      } else {
        console.log(NOTE_LOG.TABLE_READY);
      }
    });
  }

  async create(note: Omit<CaseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseNote> {
    return new Promise((resolve, reject) => {
      const id = `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
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

      this.db.run(NOTE_TABLE.INSERT_SQL, params, function(err) {
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
      this.db.get(NOTE_TABLE.SELECT_BY_ID, [id], (err, row: CaseNote) => {
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
      this.db.all(NOTE_TABLE.SELECT_BY_PATIENT, [patientId], (err, rows: CaseNote[]) => {
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
      this.db.run(NOTE_TABLE.UPDATE_STATUS, [status, new Date().toISOString(), id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(NOTE_TABLE.DELETE_BY_ID, [id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
