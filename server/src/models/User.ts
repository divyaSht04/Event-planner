import { Knex } from "knex";
import bcrypt from "bcrypt";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  refresh_token?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone_number: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class UserModel {
  private db: Knex;
  constructor(private database: Knex) {
    this.db = database;
  }

  async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [user] = await this.db("users")
      .insert({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone_number: userData.phone_number,
      })
      .returning(["id", "email", "name", "phone_number", "created_at", "updated_at"]);

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.db("users")
      .where({ email })
      .select(["id", "email", "password", "name", "phone_number", "refresh_token", "created_at", "updated_at"])
      .first();
  }

  async findById(id: number): Promise<User> {
    return await this.db("users")
      .where({ id })
      .select(["id", "email", "name", "phone_number", "created_at", "updated_at"])
      .first();
  }

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return await this.db("users")
      .where({ refresh_token: refreshToken })
      .select(["id", "email", "name", "phone_number", "created_at", "updated_at"])
      .first();
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.db("users")
      .where({ id: userId })
      .update({
        refresh_token: refreshToken,
        updated_at: this.db.fn.now()
      });
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
