import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import { logger } from './config/LoggerConfig';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import tagRoutes from './routes/tagRoutes';
import categoryRoutes from './routes/categoryRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL! || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(loggingMiddleware);

setupSwagger(app);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});