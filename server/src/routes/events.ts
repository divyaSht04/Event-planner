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

router.get('/upcoming', (req, res) => eventController.getUpcoming(req, res));
router.get('/past', (req, res) => eventController.getPast(req, res));

router.use(authMiddleware);

router.post('/', (req, res) => eventController.create(req, res));
router.get('/', (req, res) => eventController.getAll(req, res));
router.get('/my-events', (req, res) => eventController.getUserEvents(req, res));
router.get('/:id', (req, res) => eventController.getById(req, res));
router.put('/:id', (req, res) => eventController.update(req, res));
router.delete('/:id', (req, res) => eventController.delete(req, res));

export default router;