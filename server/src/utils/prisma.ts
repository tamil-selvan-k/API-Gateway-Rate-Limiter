import { prisma } from '@config/prisma.config';


const checkConnection = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch {
        return false;
    }
};

export { prisma, checkConnection };
