import { prisma } from '@config/prisma.config';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@utils/pagination';
import { Prisma } from '@prisma/client';

export interface ApiModel {
    id: string;
    name: string;
    gatewayId: string;
    upstreamBaseUrl: string;
    isActive: boolean;
    accountId: string;
    requestTimeoutMs?: number | null;
    rateLimitRps?: number | null;
    rateLimitBurst?: number | null;
    createdAt: Date;
    updatedAt: Date;
}

type ApiRow = {
    id: string;
    name: string;
    gatewayId: string;
    upstreamBaseUrl: string;
    isActive: boolean;
    accountId: string;
    createdAt: Date;
    updatedAt: Date;
};

export class ApiRepository {
    private isMissingRequestTimeoutColumn(error: unknown) {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2022' &&
            String((error.meta as { column?: string } | undefined)?.column ?? '').includes(
                'requestTimeoutMs',
            )
        );
    }

    private mapLegacyApi(row: ApiRow): ApiModel {
        return {
            ...row,
            requestTimeoutMs: 10000,
            rateLimitRps: null,
            rateLimitBurst: null,
        };
    }

    private async findByIdLegacy(id: string): Promise<ApiModel | null> {
        const rows = await prisma.$queryRaw<ApiRow[]>`
            SELECT "id", "name", "gatewayId", "upstreamBaseUrl", "isActive", "accountId", "createdAt", "updatedAt"
            FROM "Api"
            WHERE "id" = ${id}
            LIMIT 1
        `;
        return rows[0] ? this.mapLegacyApi(rows[0]) : null;
    }

    private async findByGatewayIdLegacy(gatewayId: string): Promise<ApiModel | null> {
        const rows = await prisma.$queryRaw<ApiRow[]>`
            SELECT "id", "name", "gatewayId", "upstreamBaseUrl", "isActive", "accountId", "createdAt", "updatedAt"
            FROM "Api"
            WHERE "gatewayId" = ${gatewayId}
            LIMIT 1
        `;
        return rows[0] ? this.mapLegacyApi(rows[0]) : null;
    }

    private async findByAccountIdLegacy(
        accountId: string,
        offset: number,
        limit: number,
    ): Promise<ApiModel[]> {
        const rows = await prisma.$queryRaw<ApiRow[]>`
            SELECT "id", "name", "gatewayId", "upstreamBaseUrl", "isActive", "accountId", "createdAt", "updatedAt"
            FROM "Api"
            WHERE "accountId" = ${accountId}
            ORDER BY "createdAt" DESC
            OFFSET ${offset}
            LIMIT ${limit}
        `;
        return rows.map((row) => this.mapLegacyApi(row));
    }

    async create(data: Prisma.ApiCreateInput): Promise<ApiModel> {
        try {
            return (await prisma.api.create({ data })) as unknown as ApiModel;
        } catch (error) {
            if (!this.isMissingRequestTimeoutColumn(error)) {
                throw error;
            }

            const { requestTimeoutMs: _requestTimeoutMs, ...legacyData } = data as Prisma.ApiCreateInput & {
                requestTimeoutMs?: number;
            };

            return (await prisma.api.create({ data: legacyData })) as unknown as ApiModel;
        }
    }

    async findById(id: string): Promise<ApiModel | null> {
        try {
            return (await prisma.api.findUnique({
                where: { id },
                include: { account: true }
            })) as unknown as ApiModel | null;
        } catch (error) {
            if (!this.isMissingRequestTimeoutColumn(error)) {
                throw error;
            }
            return this.findByIdLegacy(id);
        }
    }

    async findByGatewayId(gatewayId: string): Promise<ApiModel | null> {
        try {
            return (await prisma.api.findUnique({
                where: { gatewayId },
            })) as unknown as ApiModel | null;
        } catch (error) {
            if (!this.isMissingRequestTimeoutColumn(error)) {
                throw error;
            }
            return this.findByGatewayIdLegacy(gatewayId);
        }
    }

    async findByAccountId(
        accountId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<ApiModel[]> {
        try {
            return (await prisma.api.findMany({
                where: { accountId },
                skip: offset,
                take: limit,
            })) as unknown as ApiModel[];
        } catch (error) {
            if (!this.isMissingRequestTimeoutColumn(error)) {
                throw error;
            }
            return this.findByAccountIdLegacy(accountId, offset, limit);
        }
    }

    async update(id: string, data: Prisma.ApiUpdateInput): Promise<ApiModel> {
        try {
            return (await prisma.api.update({
                where: { id },
                data,
            })) as unknown as ApiModel;
        } catch (error) {
            if (!this.isMissingRequestTimeoutColumn(error)) {
                throw error;
            }

            const { requestTimeoutMs: _requestTimeoutMs, ...legacyData } = data as Prisma.ApiUpdateInput & {
                requestTimeoutMs?: number;
            };

            return (await prisma.api.update({
                where: { id },
                data: legacyData,
            })) as unknown as ApiModel;
        }
    }

    async delete(id: string): Promise<ApiModel> {
        return (await prisma.api.delete({
            where: { id },
        })) as unknown as ApiModel;
    }
}
