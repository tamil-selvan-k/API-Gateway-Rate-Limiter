import { Router } from 'express';
import { ApiKeyController } from './apiKey.controller';
import { ApiKeyRepository } from './apiKey.repository';
import { ApiKeyService } from './apiKey.service';
import { validate } from '@middleware/validate';
import { createApiKeySchema, getApiKeysByApiSchema, revokeApiKeySchema } from './apiKey.schema';

const router = Router();
const apiKeyRepository = new ApiKeyRepository();
const apiKeyService = new ApiKeyService(apiKeyRepository);
const apiKeyController = new ApiKeyController(apiKeyService);

router.post('/', validate(createApiKeySchema), apiKeyController.createKey);
router.get('/api/:apiId', validate(getApiKeysByApiSchema), apiKeyController.getKeysByApi);
router.get('/account/:accountId', apiKeyController.getKeysByAccount); // No schema for this yet in original, kept simple
router.patch('/:id/revoke', validate(revokeApiKeySchema), apiKeyController.revokeKey);
router.post('/:id/rotate', validate(revokeApiKeySchema), apiKeyController.rotateKey);

export { router as apiKeyRoutes };
