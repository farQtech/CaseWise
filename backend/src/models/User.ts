import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { USER_TABLE, USER_ROLE, ADMIN_USER, USER_LOG } from './constants';

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
    const role = userData.role || USER_ROLE.USER;

    return new Promise((resolve, reject) => {
      this.db.run(
        USER_TABLE.INSERT,
        [id, userData.email, passwordHash, role],
        function (err) {
          if (err) {
            reject(err);
            return;
          }

          this.get(USER_TABLE.SELECT_BY_ID, [id], (err: any, row: any) => {
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
      this.db.get(USER_TABLE.SELECT_BY_EMAIL, [email], (err: any, row: any) => {
        if (err) return reject(err);
        resolve(row as User || null);
      });
    });
  }

  async findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(USER_TABLE.SELECT_BY_ID, [id], (err: any, row: any) => {
        if (err) return reject(err);
        resolve(row as User || null);
      });
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async seedAdminUser(): Promise<void> {
    const existingUser = await this.findByEmail(ADMIN_USER.EMAIL);
    if (existingUser) {
      console.log(USER_LOG.ADMIN_EXISTS);
      return;
    }

    try {
      await this.createUser({
        email: ADMIN_USER.EMAIL,
        password: ADMIN_USER.PASSWORD,
        role: USER_ROLE.ADMIN
      });
      console.log(USER_LOG.ADMIN_SEEDED);
    } catch (error) {
      console.error(USER_LOG.ERROR_SEED_ADMIN, error);
    }
  }
}
