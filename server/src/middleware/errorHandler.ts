import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';
import { config } from '@config/index';
import { logger } from './logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any[] = [];

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    } else {
        // Handle generic errors (like Prisma or other libraries)
        message = err.message || 'Something went wrong';
    }

    // Log error using centralized logger
    logger.error(`${req.method} ${req.path} - ${message}`, {
        statusCode,
        stack: config.nodeEnv === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
};
