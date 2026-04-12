import { Worker } from 'worker_threads';

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
    | {
          task: 'generateToken';
          payload: { id: string; email: string };
          secret: string;
      }
    | {
          task: 'verifyToken';
          token: string;
          secret: string;
      }
    | {
          task: 'hashApiKey';
          key: string;
      }
    | {
          task: 'randomHex';
          bytes: number;
          prefix?: string;
      };

type SecurityWorkerResponse =
    | { id: number; result: unknown }
    | {
          id: number;
          error: {
              message: string;
              name: string;
              stack?: string;
          };
      };

type PendingTask = {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    task: SecurityWorkerTask['task'];
};

class SecurityWorkerRunner {
    private worker: Worker | null = null;
    private nextId = 0;
    private pending = new Map<number, PendingTask>();

    async run<T>(task: SecurityWorkerTask): Promise<T> {
        const worker = this.getWorker();

        return new Promise<T>((resolve, reject) => {
            const id = ++this.nextId;
            this.pending.set(id, {
                task: task.task,
                resolve: (value) => resolve(value as T),
                reject,
            });

            worker.postMessage({ id, ...task });
        });
    }

    private getWorker() {
        if (this.worker) {
            return this.worker;
        }

        this.worker = new Worker(this.getWorkerSource(), { eval: true });
        this.worker.on('message', (message: SecurityWorkerResponse) => this.handleMessage(message));
        this.worker.on('error', (error) =>
            this.failPendingTasks(error instanceof Error ? error : new Error(String(error))),
        );
        this.worker.on('exit', (code) => {
            if (code !== 0) {
                this.failPendingTasks(new Error(`Security worker exited with code ${code}`));
            }
        });

        return this.worker;
    }

    private getWorkerSource() {
        return `
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { parentPort } = require('worker_threads');

const handlers = {
    generateToken(message) {
        return jwt.sign(message.payload, message.secret, {
            expiresIn: '7d',
        });
    },
    verifyToken(message) {
        return jwt.verify(message.token, message.secret);
    },
    hashApiKey(message) {
        return crypto.createHash('sha256').update(message.key).digest('hex');
    },
    randomHex(message) {
        return String(message.prefix || '') + crypto.randomBytes(message.bytes).toString('hex');
    },
};

parentPort.on('message', (message) => {
    try {
        const result = handlers[message.task](message);
        parentPort.postMessage({ id: message.id, result });
    } catch (error) {
        parentPort.postMessage({
            id: message.id,
            error: {
                message: error && error.message ? error.message : 'Worker task failed',
                name: error && error.name ? error.name : 'Error',
                stack: error && error.stack ? error.stack : undefined,
            },
        });
    }
});
`;
    }

    private handleMessage(message: SecurityWorkerResponse) {
        const pendingTask = this.pending.get(message.id);
        if (!pendingTask) {
            return;
        }

        this.pending.delete(message.id);

        if ('error' in message) {
            pendingTask.reject(
                new WorkerTaskExecutionError(
                    `Security worker task "${pendingTask.task}" failed`,
                    pendingTask.task,
                    message.error.message,
                ),
            );
            return;
        }

        pendingTask.resolve(message.result);
    }

    private failPendingTasks(error: Error) {
        const pendingTasks = [...this.pending.values()];
        this.pending.clear();
        this.worker = null;

        for (const pendingTask of pendingTasks) {
            pendingTask.reject(
                new WorkerTaskExecutionError(
                    `Security worker task "${pendingTask.task}" failed`,
                    pendingTask.task,
                    error.message,
                ),
            );
        }
    }
}

const securityWorkerRunner = new SecurityWorkerRunner();

export const runSecurityWorkerTask = <T>(task: SecurityWorkerTask) => {
    return securityWorkerRunner.run<T>(task);
};

export { WorkerTaskExecutionError };
