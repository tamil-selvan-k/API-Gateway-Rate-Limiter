import { AppError } from './AppError';
import { runSecurityWorkerTask, WorkerTaskExecutionError } from './workerTask.util';

export class PasswordUtil {
    private static readonly SALT_ROUNDS = 10;

    static async hash(password: string): Promise<string> {
        try {
            return await runSecurityWorkerTask<string>({
                task: 'hashPassword',
                password,
                saltRounds: this.SALT_ROUNDS,
            });
        } catch (error) {
            if (error instanceof WorkerTaskExecutionError) {
                throw new AppError('Unable to route password secure hashing', 500, [
                    { task: error.task, message: error.causeMessage ?? error.message },
                ]);
            }
            throw new AppError('Error hashing password', 500);
        }
    }

    static async compare(password: string, hash: string): Promise<boolean> {
        try {
            return await runSecurityWorkerTask<boolean>({
                task: 'comparePassword',
                password,
                hash,
            });
        } catch (error) {
            if (error instanceof WorkerTaskExecutionError) {
                throw new AppError('Unable to route password secure comparison', 500, [
                    { task: error.task, message: error.causeMessage ?? error.message },
                ]);
            }
            throw new AppError('Error comparing password', 500);
        }
    }
}
