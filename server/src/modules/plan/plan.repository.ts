import { prisma } from '@config/prisma.config';
import { Plan } from '@prisma/client';

export class PlanRepository {
    async findAll(onlyActive: boolean = true): Promise<Plan[]> {
        return prisma.plan.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { monthlyRequestLimit: 'asc' },
        });
    }

    async findById(id: string): Promise<Plan | null> {
        return prisma.plan.findUnique({
            where: { id },
        });
    }
}
