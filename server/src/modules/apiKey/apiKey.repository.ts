import { prisma } from '@utils/prisma';
import { ApiKey, Prisma } from '@prisma/client';

export class ApiKeyRepository {
    async findByKey(key: string): Promise<ApiKey | null> {
        return prisma.apiKey.findUnique({
            where: { key },
            include: { account: true },
        });
    }

    async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
        return prisma.apiKey.create({ data });
    }

    async findByAccountId(accountId: string): Promise<ApiKey[]> {
        return prisma.apiKey.findMany({
            where: { accountId },
        });
    }

    async update(id: string, data: Prisma.ApiKeyUpdateInput): Promise<ApiKey> {
        return prisma.apiKey.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<ApiKey> {
        return prisma.apiKey.delete({
            where: { id },
        });
    }
}
