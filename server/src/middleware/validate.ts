import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/AppError';

export const validate = (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message
                }));
                return next(new AppError('Validation failed', 400, errors));
            }
            next(error);
        }
    };
