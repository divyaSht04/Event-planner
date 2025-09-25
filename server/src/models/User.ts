import { Knex } from "knex";
import bcrypt from "bcrypt";
import type { User, CreateUserData } from "./model-types";

export class UserModel {
  private db: Knex;
  constructor(private database: Knex) {
    this.db = database;
  }

  async create(userData: CreateUserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const [insertedId] = await this.db("users")
      .insert({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone_number: userData.phone_number,
      });

    const user = await this.db("users")
      .where({ id: insertedId })
      .select(["id", "email", "name", "phone_number", "created_at", "updated_at"])
      .first();

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.db("users")
        .where({email})
        .select(["id", "email", "password", "name", "phone_number", "refresh_token", "created_at", "updated_at"])
        .first();
  }

  async findById(id: number): Promise<User> {
    return this.db("users")
        .where({id})
        .select(["id", "email", "name", "phone_number", "created_at", "updated_at"])
        .first();
  }

  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return this.db("users")
        .where({refresh_token: refreshToken})
        .select(["id", "email", "name", "phone_number", "created_at", "updated_at"])
        .first();
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return this.db("users")
        .where({phone_number: phoneNumber})
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
