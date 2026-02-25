import { PlanRepository } from './plan.repository';
import { Plan } from '@prisma/client';

export class PlanService {
    constructor(private planRepository: PlanRepository) { }

    async listPlans(onlyActive: boolean = true): Promise<Plan[]> {
        return this.planRepository.findAll(onlyActive);
    }

    async getPlanById(id: string): Promise<Plan | null> {
        return this.planRepository.findById(id);
    }
}
