import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { logger } from '../config/LoggerConfig';
import dotenv from 'dotenv';

dotenv.config();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

interface JwtPayload {
  id: number;
  email: string;
}

export const authenticateToken = (userModel: UserModel) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const accessToken = req.cookies.accessToken;
      
      if (!accessToken) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      logger.info(`Authenticating token for: ${req.method} ${req.path}`);

      const jwtSecret = process.env.JWT_SECRET!;
      const decoded = jwt.verify(accessToken, jwtSecret) as JwtPayload;
      logger.debug(`Token decoded for user: ${decoded.id}`);

      
      const user = await userModel.findById(decoded.id);
      
      if (!user) {
        res.status(401).json({ error: 'Invalid token - user not found' });
        return;
      }

      req.user = {
        id: user.id!,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (error) {
      logger.error(`Authentication error: ${error}`);
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
};