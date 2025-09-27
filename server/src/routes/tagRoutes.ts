import { Router } from 'express';
import TagController from '../controllers/TagController';
import { authenticateToken } from '../middleware/auth';
import { UserModel } from '../models/User';
import knex from 'knex';
import dbConfig from '../utils/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const db = knex(dbConfig);
const userModel = new UserModel(db);
const tagController = new TagController(db);

const authMiddleware = authenticateToken(userModel);

// Apply authentication middleware to all tag routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     tags: [Tags]
 *     summary: Get all tags
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/', (req, res) => tagController.getAllTags(req, res));

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     tags: [Tags]
 *     summary: Get tag by ID
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
 *         description: Tag details
 */
router.get('/:id', (req, res) => tagController.getTagById(req, res));

/**
 * @swagger
 * /api/tags:
 *   post:
 *     tags: [Tags]
 *     summary: Create new tag
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
 *         description: Tag created
 */
router.post('/', (req, res) => tagController.createTag(req, res));

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     tags: [Tags]
 *     summary: Update tag
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
 *         description: Tag updated
 */
router.put('/:id', (req, res) => tagController.updateTag(req, res));

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     summary: Delete tag
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
 *         description: Tag deleted
 */
router.delete('/:id', (req, res) => tagController.deleteTag(req, res));

/**
 * @swagger
 * /api/tags/{id}/events:
 *   get:
 *     tags: [Tags]
 *     summary: Get events by tag
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
 *         description: Events with this tag
 */
router.get('/:id/events', (req, res) => tagController.getTagEvents(req, res));

export default router;