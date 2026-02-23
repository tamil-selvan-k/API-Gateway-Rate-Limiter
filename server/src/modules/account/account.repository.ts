import { prisma } from '@config/prisma.config';
import { Account, Prisma } from '@prisma/client';

export class AccountRepository {
    async findByEmail(email: string): Promise<Account | null> {
        return prisma.account.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<Account | null> {
        return prisma.account.findUnique({
            where: { id },
        });
    }

    async create(data: Prisma.AccountCreateInput): Promise<Account> {
        return prisma.account.create({ data });
    }

    async update(id: string, data: Prisma.AccountUpdateInput): Promise<Account> {
        return prisma.account.update({
            where: { id },
            data: data as any,
        });
    }
}
