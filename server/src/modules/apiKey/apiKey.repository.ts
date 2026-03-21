import { prisma } from '@utils/prisma';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@utils/pagination';
import { ApiKey, Prisma } from '@prisma/client';

type ApiKeyRow = {
    id: string;
    key: string;
    name: string;
    accountId: string;
    isActive: boolean;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    apiId: string;
};

export class ApiKeyRepository {
    private isMissingApiRequestTimeoutColumn(error: unknown) {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2022' &&
            String((error.meta as { column?: string } | undefined)?.column ?? '').includes(
                'requestTimeoutMs',
            )
        );
    }

    private async findByKeyLegacy(key: string): Promise<ApiKey | null> {
        const rows = await prisma.$queryRaw<ApiKeyRow[]>`
            SELECT "id", "key", "name", "accountId", "isActive", "expiresAt", "createdAt", "updatedAt", "apiId"
            FROM "ApiKey"
            WHERE "key" = ${key}
            LIMIT 1
        `;
        return (rows[0] ?? null) as ApiKey | null;
    }

    private async findByAccountIdLegacy(
        accountId: string,
        offset: number,
        limit: number,
    ): Promise<ApiKey[]> {
        const rows = await prisma.$queryRaw<ApiKeyRow[]>`
            SELECT "id", "key", "name", "accountId", "isActive", "expiresAt", "createdAt", "updatedAt", "apiId"
            FROM "ApiKey"
            WHERE "accountId" = ${accountId}
            ORDER BY "createdAt" DESC
            OFFSET ${offset}
            LIMIT ${limit}
        `;
        return rows as ApiKey[];
    }

    async findByKey(key: string): Promise<ApiKey | null> {
        try {
            return await prisma.apiKey.findUnique({
                where: { key },
            }) as ApiKey | null;
        } catch (error) {
            if (!this.isMissingApiRequestTimeoutColumn(error)) {
                throw error;
            }
            return this.findByKeyLegacy(key);
        }
    }

    async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
        return prisma.apiKey.create({ data: data as unknown as Prisma.ApiKeyUncheckedCreateInput }) as unknown as Promise<ApiKey>;
    }

    async findByAccountId(
        accountId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<ApiKey[]> {
        try {
            return await prisma.apiKey.findMany({
                where: { accountId },
                skip: offset,
                take: limit,
            }) as ApiKey[];
        } catch (error) {
            if (!this.isMissingApiRequestTimeoutColumn(error)) {
                throw error;
            }
            return this.findByAccountIdLegacy(accountId, offset, limit);
        }
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

    async findById(id: string): Promise<ApiKey | null> {
        return prisma.apiKey.findUnique({
            where: { id },
        }) as Promise<ApiKey | null>;
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

