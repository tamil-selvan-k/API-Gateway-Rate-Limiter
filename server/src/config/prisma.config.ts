import { PrismaClient } from '@prisma/client';
import { config } from './index';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: config.database.url,
        },
    },
});

export { prisma };
