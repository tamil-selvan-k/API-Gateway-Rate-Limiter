import { Request } from 'express';
import { PlanService } from './plan.service';
import { ApiResponse } from '@utils/ApiResponse';
import { asyncHandler } from '@utils/asyncHandler';

export class PlanController {
    constructor(private planService: PlanService) { }

    listPlans = asyncHandler(async (req: Request) => {
        const plans = await this.planService.listPlans();
        return new ApiResponse(200, plans, 'Plans retrieved successfully');
    });

    getPlan = asyncHandler(async (req: Request) => {
        const id = req.params.id as string;
        const plan = await this.planService.getPlanById(id);
        return new ApiResponse(200, plan, 'Plan retrieved successfully');
    });
}
