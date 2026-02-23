import { Request, Response, NextFunction } from 'express';
import { JwtUtil, TokenPayload } from '@utils/jwt.util';
import { AppError } from '@utils/AppError';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = JwtUtil.verifyToken(token);

        // Attach decoded user info to request
        (req as any).user = decoded;

        next();
    } catch (error) {
        next(error);
    }
};
