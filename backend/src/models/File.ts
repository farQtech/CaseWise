import { Database } from 'sqlite3';

export interface FileRecord {
  id: string;
  patientId: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  mimeType: string;
  size: number;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  metadata?: string; // JSON string for additional data
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
    const sql = `
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
    `;
    
    this.db.run(sql, (err) => {
      if (err) {
        console.error('Error creating files table:', err);
      } else {
        console.log('Files table ready');
      }
    });
  }

  async create(fileData: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FileRecord> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const now = new Date().toISOString();
      
      const sql = `
        INSERT INTO files (id, patientId, originalName, fileName, filePath, fileType, mimeType, size, status, metadata, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
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

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...fileData,
            createdAt: now,
            updatedAt: now
          });
        }
      });
    });
  }

  async findById(id: string): Promise<FileRecord | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM files WHERE id = ?';
      
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async findByPatientId(patientId: string): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM files WHERE patientId = ? ORDER BY createdAt DESC';
      
      this.db.all(sql, [patientId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async findByStatus(status: FileRecord['status']): Promise<FileRecord[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM files WHERE status = ? ORDER BY createdAt ASC';
      
      this.db.all(sql, [status], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async updateStatus(id: string, status: FileRecord['status'], metadata?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE files 
        SET status = ?, metadata = ?, updatedAt = ? 
        WHERE id = ?
      `;
      
      const params = [status, metadata || null, new Date().toISOString(), id];

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM files WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async deleteByPatientId(patientId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM files WHERE patientId = ?';
      
      this.db.run(sql, [patientId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async notifyWorker(files: FileRecord[]): Promise<void> {
    const workerUrl = process.env.WORKER_URL || 'http://localhost:3002';
    
    try {
      // This would be a POST request to the worker to notify about new files
      // For now, we'll just log it since the worker polls for files
      console.log(`📤 Notifying worker about ${files.length} new files:`, 
        files.map(f => ({ id: f.id, originalName: f.originalName }))
      );
    } catch (error) {
      console.error('Failed to notify worker:', error);
    }
  }
}
