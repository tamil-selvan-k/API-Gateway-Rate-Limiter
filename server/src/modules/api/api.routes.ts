import { Router } from 'express';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ApiRepository } from './api.repository';
import { auth } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { createApiSchema, updateApiSchema } from './api.schema';

const router = Router();
const apiRepository = new ApiRepository();
const apiService = new ApiService(apiRepository);
const apiController = new ApiController(apiService);

router.use(auth);

router.post('/', validate(createApiSchema), apiController.createApi);
router.get('/', apiController.listApis);
router.get('/:id', apiController.getApi);
router.patch('/:id', validate(updateApiSchema), apiController.updateApi);
router.delete('/:id', apiController.deleteApi);

export { router as apiRoutes };
