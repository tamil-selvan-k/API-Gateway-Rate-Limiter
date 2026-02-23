import morgan from 'morgan';
import winston from 'winston';
import { config } from '@config/index';

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
);

const logger = winston.createLogger({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        new winston.transports.File({
            filename: 'logs/combined.log'
        }),
        new winston.transports.File({
            filename: 'server_log.txt',
            format: fileFormat
        }),
    ],
});

export const requestLogger = morgan(
    config.nodeEnv === 'development' ? 'dev' : 'combined',
    {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }
);

export { logger };
