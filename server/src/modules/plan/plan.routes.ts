import { Router } from 'express';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { PlanRepository } from './plan.repository';

const router = Router();
const planRepository = new PlanRepository();
const planService = new PlanService(planRepository);
const planController = new PlanController(planService);

router.get('/', planController.listPlans);
router.get('/:id', planController.getPlan);

export { router as planRoutes };
