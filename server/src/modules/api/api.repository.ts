import { prisma } from '@config/prisma.config';
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '@utils/pagination';
import { Api, Prisma } from '@prisma/client';

export class ApiRepository {
    async create(data: Prisma.ApiCreateInput): Promise<Api> {
        return prisma.api.create({ data });
    }

    async findById(id: string): Promise<Api | null> {
        return prisma.api.findUnique({
            where: { id },
            include: { account: true }
        });
    }

    async findByGatewayId(gatewayId: string): Promise<Api | null> {
        return prisma.api.findUnique({
            where: { gatewayId },
        });
    }

    async findByAccountId(
        accountId: string,
        offset: number = DEFAULT_OFFSET,
        limit: number = DEFAULT_LIMIT,
    ): Promise<Api[]> {
        return prisma.api.findMany({
            where: { accountId },
            skip: offset,
            take: limit,
        });
    }

    async update(id: string, data: Prisma.ApiUpdateInput): Promise<Api> {
        return prisma.api.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Api> {
        return prisma.api.delete({
            where: { id },
        });
    }
}
