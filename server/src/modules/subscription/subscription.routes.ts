import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repository';
import { auth } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { subscribeSchema, upgradeSchema } from './subscription.schema';

const router = Router();
const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

router.use(auth);

router.post('/subscribe', validate(subscribeSchema), subscriptionController.subscribe);
router.post('/upgrade', validate(upgradeSchema), subscriptionController.upgrade);
router.post('/cancel', subscriptionController.cancel);
router.get('/status', subscriptionController.getStatus);

export { router as subscriptionRoutes };
