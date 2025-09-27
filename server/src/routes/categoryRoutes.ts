import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import { authenticateToken } from '../middleware/auth';
import { UserModel } from '../models/User';
import knex from 'knex';
import dbConfig from '../utils/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const db = knex(dbConfig);
const userModel = new UserModel(db);
const categoryController = new CategoryController(db);

const authMiddleware = authenticateToken(userModel);

router.use(authMiddleware);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', (req, res) => categoryController.getAllCategories(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 */
router.get('/:id', (req, res) => categoryController.getCategoryById(req, res));

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', (req, res) => categoryController.createCategory(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put('/:id', (req, res) => categoryController.updateCategory(req, res));

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.delete('/:id', (req, res) => categoryController.deleteCategory(req, res));

/**
 * @swagger
 * /api/categories/{id}/events:
 *   get:
 *     tags: [Categories]
 *     summary: Get events by category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Events in this category
 */
router.get('/:id/events', (req, res) => categoryController.getCategoryEvents(req, res));

export default router;