import workerpool from 'workerpool';
import path from 'path';

class WorkerTaskExecutionError extends Error {
    constructor(
        message: string,
        public readonly task: string,
        public readonly causeMessage?: string,
    ) {
        super(message);
        this.name = 'WorkerTaskExecutionError';
    }
}

type SecurityWorkerTask =
    | { task: 'generateToken'; payload: { id: string; email: string }; secret: string }
    | { task: 'verifyToken'; token: string; secret: string }
    | { task: 'hashApiKey'; key: string }
    | { task: 'randomHex'; bytes: number; prefix?: string }
    | { task: 'hashPassword'; password: string; saltRounds: number }
    | { task: 'comparePassword'; password: string; hash: string };

const ext = path.extname(__filename);
const workerPath = path.join(__dirname, `../workers/security.worker${ext}`);

const pool = workerpool.pool(workerPath, {
    workerType: 'thread',
});

export const runSecurityWorkerTask = async <T>(task: SecurityWorkerTask): Promise<T> => {
    try {
        switch (task.task) {
            case 'generateToken':
                return pool.exec('generateToken', [{ payload: task.payload, secret: task.secret }]) as unknown as Promise<T>;
            case 'verifyToken':
                return pool.exec('verifyToken', [{ token: task.token, secret: task.secret }]) as unknown as Promise<T>;
            case 'hashApiKey':
                return pool.exec('hashApiKey', [{ key: task.key }]) as unknown as Promise<T>;
            case 'randomHex':
                return pool.exec('randomHex', [{ bytes: task.bytes, prefix: task.prefix }]) as unknown as Promise<T>;
            case 'hashPassword':
                return pool.exec('hashPassword', [{ password: task.password, saltRounds: task.saltRounds }]) as unknown as Promise<T>;
            case 'comparePassword':
                return pool.exec('comparePassword', [{ password: task.password, hash: task.hash }]) as unknown as Promise<T>;
            default:
                throw new Error(`Unknown worker task`);
        }
    } catch (error: any) {
        throw new WorkerTaskExecutionError(
            `Security worker task "${task.task}" failed`,
            task.task,
            error.message
        );
    }
};

export { WorkerTaskExecutionError };
