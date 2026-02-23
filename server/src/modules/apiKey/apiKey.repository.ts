import { prisma } from '@utils/prisma';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@utils/pagination';
import { ApiKey, Prisma } from '@prisma/client';

export class ApiKeyRepository {
    async findByKey(key: string): Promise<ApiKey | null> {
        return prisma.apiKey.findUnique({
            where: { key },
            include: {
                account: true,
                api: true
            } as unknown as Prisma.ApiKeyInclude,
        }) as unknown as Promise<ApiKey | null>;
    }

    async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
        return prisma.apiKey.create({ data: data as unknown as Prisma.ApiKeyUncheckedCreateInput }) as unknown as Promise<ApiKey>;
    }

    async findByAccountId(
        accountId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<ApiKey[]> {
        return prisma.apiKey.findMany({
            where: { accountId },
            include: { api: true } as unknown as Prisma.ApiKeyInclude,
            skip: offset,
            take: limit,
        }) as unknown as Promise<ApiKey[]>;
    }

    async findByApiId(
        apiId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<ApiKey[]> {
        return prisma.apiKey.findMany({
            where: { apiId } as unknown as Prisma.ApiKeyWhereInput,
            skip: offset,
            take: limit,
        }) as unknown as Promise<ApiKey[]>;
    }

    async update(id: string, data: Prisma.ApiKeyUpdateInput): Promise<ApiKey> {
        return prisma.apiKey.update({
            where: { id },
            data: data as unknown as Prisma.ApiKeyUncheckedUpdateInput,
        }) as unknown as Promise<ApiKey>;
    }

    async delete(id: string): Promise<ApiKey> {
        return prisma.apiKey.delete({
            where: { id },
        }) as unknown as Promise<ApiKey>;
    }

}

