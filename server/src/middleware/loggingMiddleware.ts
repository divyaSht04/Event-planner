import {Request, Response, NextFunction} from 'express';
import {logger} from '../config/LoggerConfig';

export const loggingMiddleware =
    (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });

    next();
};