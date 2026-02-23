import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { AppError } from './AppError';

export interface TokenPayload {
    id: string;
    email: string;
}

export class JwtUtil {
    static generateToken(payload: TokenPayload): string {
        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: '7d',
        });
    }

    static verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, config.jwt.secret) as TokenPayload;
        } catch (error) {
            throw new AppError('Invalid or expired token', 401);
        }
    }
}
