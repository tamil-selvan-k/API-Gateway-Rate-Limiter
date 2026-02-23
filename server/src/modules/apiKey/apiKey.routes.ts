import { Router } from 'express';
import { ApiKeyController } from './apiKey.controller';
import { ApiKeyService } from './apiKey.service';
import { ApiKeyRepository } from './apiKey.repository';
import { validate } from '@middleware/validate';
import { createApiKeySchema, getApiKeysSchema, revokeApiKeySchema } from './apiKey.schema';

const router = Router();

// Dependency Injection manually (can use a DI container like Inversify for larger projects)
const repository = new ApiKeyRepository();
const service = new ApiKeyService(repository);
const controller = new ApiKeyController(service);

router.post('/', validate(createApiKeySchema), controller.createKey);
router.get('/account/:accountId', validate(getApiKeysSchema), controller.getKeys);
router.patch('/:id/revoke', validate(revokeApiKeySchema), controller.revokeKey);

export { router as apiKeyRoutes };
