import { Database } from 'sqlite3';
import { FILE_TABLE, FILE_STATUS, FILE_LOG } from './constants';

export interface FileRecord {
  id: string;
  patientId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  size: number;
  status: keyof typeof FILE_STATUS;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export class FileModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initTable();
  }

  private initTable(): void {
    this.db.run(FILE_TABLE.CREATE_SQL, (err) => {
      if (err) {
        console.error(FILE_LOG.ERROR_CREATE_TABLE, err);
      } else {
        console.log(FILE_LOG.TABLE_READY);
      }
    });
  }

  async create(fileData: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileRecord> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const now = new Date().toISOString();
      const params = [
        id,
        fileData.patientId,
        fileData.originalName,
        fileData.fileName,
        fileData.filePath,
        fileData.fileType,
        fileData.mimeType,
        fileData.size,
        fileData.status,
        fileData.metadata || null,
        now,
        now
      ];

      this.db.run(FILE_TABLE.INSERT_SQL, params, function(err) {
        if (err) reject(err);
        else resolve({ id, ...fileData, createdAt: now, updatedAt: now });
      });
    });
  }

  async findById(id: string): Promise<FileRecord | null> {
    return new Promise((resolve, reject) => {
      this.db.get(FILE_TABLE.SELECT_BY_ID, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  async findByPatientId(patientId: string): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      this.db.all(FILE_TABLE.SELECT_BY_PATIENT, [patientId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async findByStatus(status: FileRecord['status']): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      this.db.all(FILE_TABLE.SELECT_BY_STATUS, [status], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  async updateStatus(id: string, status: FileRecord['status'], metadata?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const params = [status, metadata || null, new Date().toISOString(), id];
      this.db.run(FILE_TABLE.UPDATE_STATUS, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(FILE_TABLE.DELETE_BY_ID, [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteByPatientId(patientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(FILE_TABLE.DELETE_BY_PATIENT, [patientId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async notifyWorker(files: FileRecord[]): Promise<void> {
    try {
      console.log(`${FILE_LOG.NOTIFY_WORKER} ${files.length} new files:`, 
        files.map(f => ({ id: f.id, originalName: f.originalName }))
      );
    } catch (error) {
      console.error(FILE_LOG.FAILED_NOTIFY_WORKER, error);
    }
  }
}
