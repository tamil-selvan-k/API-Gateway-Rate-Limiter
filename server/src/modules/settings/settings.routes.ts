import { Router } from 'express';
import { auth } from '@middleware/auth';
import { validate } from '@middleware/validate';
import { AccountRepository } from '@modules/account/account.repository';
import { SettingsRepository } from './settings.repository';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import {
    updateProfileSchema,
    updateSecuritySchema,
    updatePreferencesSchema,
} from './settings.schema';

const router = Router();

const accountRepository = new AccountRepository();
const settingsRepository = new SettingsRepository();
const settingsService = new SettingsService(accountRepository, settingsRepository);
const settingsController = new SettingsController(settingsService);

// All settings routes require authentication
router.get('/', auth, settingsController.getSettings);
router.put('/profile', auth, validate(updateProfileSchema), settingsController.updateProfile);
router.put('/security', auth, validate(updateSecuritySchema), settingsController.updateSecurity);
router.put('/preferences', auth, validate(updatePreferencesSchema), settingsController.updatePreferences);
router.delete('/account', auth, settingsController.deleteAccount);

export { router as settingsRoutes };
