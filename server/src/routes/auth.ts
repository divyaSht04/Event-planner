/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserModel } from '../models/User';
import { logger } from '../config/LoggerConfig';
import knex from 'knex';
import dbConfig from '../utils/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const db = knex(dbConfig);
logger.debug('Database connection initialized');

const userModel = new UserModel(db);

// Initialize controller
const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'refreshSecret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN!;
const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN!;
const authController = new AuthController(userModel, jwtSecret, jwtRefreshSecret, jwtExpiresIn, jwtRefreshExpiresIn);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Initiate user registration by sending OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_number
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email for verification
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and complete registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-otp', (req, res) => authController.verifyOTP(req, res));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', (req, res) => authController.refresh(req, res));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;