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

router.get('/', (req, res) => tagController.getAllTags(req, res));
router.get('/:id', (req, res) => tagController.getTagById(req, res));
router.post('/', (req, res) => tagController.createTag(req, res));
router.put('/:id', (req, res) => tagController.updateTag(req, res));
router.delete('/:id', (req, res) => tagController.deleteTag(req, res));
router.get('/:id/events', (req, res) => tagController.getTagEvents(req, res));

export default router;