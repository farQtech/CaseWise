import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  role?: string;
}

export class UserModel {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 12);
    const role = userData.role || 'user';

    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [id, userData.email, passwordHash, role],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          this.get('SELECT * FROM users WHERE id = ?', [id], (err: any, row: any) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row as User);
          });
        }
      );
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row as User || null);
        }
      );
    });
  }

  async findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row as User || null);
        }
      );
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async seedAdminUser(): Promise<void> {
    const adminEmail = 'admin@casewise.com';
    const adminPassword = 'admin';
    
    // Check if admin user already exists
    const existingUser = await this.findByEmail(adminEmail);
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    try {
      await this.createUser({
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      console.log('Admin user seeded successfully');
    } catch (error) {
      console.error('Error seeding admin user:', error);
    }
  }
}
