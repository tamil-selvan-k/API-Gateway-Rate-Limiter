export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly success: boolean;
    public readonly errors: any[];

    constructor(
        message: string,
        statusCode: number,
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
