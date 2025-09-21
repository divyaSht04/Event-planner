import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserModel } from '../models/User';
import knex from 'knex';
import dbConfig from '../utils/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const db = knex(dbConfig);
console.log(db.client.config.connection.password);

const userModel = new UserModel(db);

// Initialize controller
const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN!;
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN!;
const authController = new AuthController(userModel, jwtSecret, jwtRefreshSecret, jwtExpiresIn, jwtRefreshExpiresIn);

// Routes
router. post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refresh(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;