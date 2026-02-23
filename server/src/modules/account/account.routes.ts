import { Router } from 'express';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { auth } from '@middleware/auth';

const router = Router();

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);
const accountController = new AccountController(accountService);

router.post('/register', accountController.register);
router.post('/login', accountController.login);
router.get('/profile', auth, accountController.getProfile);

export { router as accountRoutes };
