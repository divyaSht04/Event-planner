/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { EventModel } from '../models/Event';
import { UserModel } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import knex from 'knex';
import dbConfig from '../utils/database';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const db = knex(dbConfig);

const eventModel = new EventModel(db);
const userModel = new UserModel(db);

const eventController = new EventController(eventModel);

const authMiddleware = authenticateToken(userModel);

/**
 * @swagger
 * /api/events/upcoming:
 *   get:
 *     summary: Get upcoming public events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of upcoming events
 */
router.get('/upcoming', (req, res) => eventController.getUpcoming(req, res));

/**
 * @swagger
 * /api/events/past:
 *   get:
 *     summary: Get past public events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of past events
 */
router.get('/past', (req, res) => eventController.getPast(req, res));

router.use(authMiddleware);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - event_date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               event_date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               event_type:
 *                 type: string
 *                 enum: [public, private]
 *               category_id:
 *                 type: integer
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', (req, res) => eventController.create(req, res));

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filtering
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *           enum: [public, private]
 *     responses:
 *       200:
 *         description: List of events with pagination
 */
router.get('/', (req, res) => eventController.getAll(req, res));

/**
 * @swagger
 * /api/events/my-events:
 *   get:
 *     summary: Get current user's events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events
 */
router.get('/my-events', (req, res) => eventController.getUserEvents(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
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
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', (req, res) => eventController.getById(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update event (creator only)
 *     tags: [Events]
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
 *         description: Event updated successfully
 *       403:
 *         description: Not authorized
 */
router.put('/:id', (req, res) => eventController.update(req, res));

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event (creator only)
 *     tags: [Events]
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
 *         description: Event deleted successfully
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', (req, res) => eventController.delete(req, res));

export default router;