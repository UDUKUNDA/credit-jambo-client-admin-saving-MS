// backend/src/routes/client/account.ts
import { Router } from 'express';
import { AccountController } from '../../controllers/AccountController';
import { authenticateToken } from '../../middlewares/auth';
import { validateTransaction } from '../../middlewares/validation';

const router = Router();
const accountController = new AccountController();

router.use(authenticateToken);

// Account routes (bind controller to keep `this` intact)
router.get('/balance', accountController.getBalance.bind(accountController));
router.post('/deposit', validateTransaction, accountController.deposit.bind(accountController));
router.post('/withdraw', validateTransaction, accountController.withdraw.bind(accountController));
router.get('/transactions', accountController.getTransactions.bind(accountController));

export default router;