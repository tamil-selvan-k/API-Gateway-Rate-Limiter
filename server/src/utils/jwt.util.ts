import { config } from '@config/index';
import { AppError } from './AppError';
import { runSecurityWorkerTask, WorkerTaskExecutionError } from './workerTask.util';

export interface TokenPayload {
    id: string;
    email: string;
}

export class JwtUtil {
    static async generateToken(payload: TokenPayload): Promise<string> {
        try {
            return await runSecurityWorkerTask<string>({
                task: 'generateToken',
                payload,
                secret: config.jwt.secret,
            });
        } catch (error) {
            if (error instanceof WorkerTaskExecutionError) {
                throw new AppError('Unable to generate authentication token', 500, [
                    { task: error.task, message: error.causeMessage ?? error.message },
                ]);
            }

            throw error;
        }
    }

    static async verifyToken(token: string): Promise<TokenPayload> {
        try {
            return await runSecurityWorkerTask<TokenPayload>({
                task: 'verifyToken',
                token,
                secret: config.jwt.secret,
            });
        } catch (error) {
            if (error instanceof WorkerTaskExecutionError) {
                throw new AppError('Invalid or expired token', 401);
            }

            throw new AppError('Invalid or expired token', 401);
        }
    }
}
