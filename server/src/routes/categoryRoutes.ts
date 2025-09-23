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

router.get('/', (req, res) => categoryController.getAllCategories(req, res));
router.get('/:id', (req, res) => categoryController.getCategoryById(req, res));
router.post('/', (req, res) => categoryController.createCategory(req, res));
router.put('/:id', (req, res) => categoryController.updateCategory(req, res));
router.delete('/:id', (req, res) => categoryController.deleteCategory(req, res));
router.get('/:id/events', (req, res) => categoryController.getCategoryEvents(req, res));

export default router;