import { Router } from 'express';
import { RateLimiterController } from './rateLimiter.controller';
import { RateLimiterRepository } from './rateLimiter.repository';
import { RateLimiterService } from './rateLimiter.service';
import { SubscriptionRepository } from '@modules/subscription/subscription.repository';
import { auth } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { rateLimiterApiIdSchema, updateRateLimiterConfigSchema } from './rateLimiter.schema';

const router = Router();
const rateLimiterRepository = new RateLimiterRepository();
const subscriptionRepository = new SubscriptionRepository();
const rateLimiterService = new RateLimiterService(rateLimiterRepository, subscriptionRepository);
const rateLimiterController = new RateLimiterController(rateLimiterService);

router.use(auth);

router.get('/config/:apiId', validate(rateLimiterApiIdSchema), rateLimiterController.getConfig);
router.put('/config/:apiId', validate(updateRateLimiterConfigSchema), rateLimiterController.updateConfig);
router.get('/usage/:apiId', validate(rateLimiterApiIdSchema), rateLimiterController.getUsage);
router.get('/hits/:apiId', validate(rateLimiterApiIdSchema), rateLimiterController.getHits);
router.get('/status/:apiId', validate(rateLimiterApiIdSchema), rateLimiterController.getStatus);

export { router as rateLimiterRoutes };
