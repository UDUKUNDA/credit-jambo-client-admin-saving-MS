import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { validateRegister, validateLogin } from '../../middlewares/validation';

const router = Router();
const authController = new AuthController();

// Registration route
// Bind the controller instance to preserve `this` (authService, etc.)
router.post('/register', validateRegister, authController.register.bind(authController));

// Login route  
router.post('/login',  authController.login.bind(authController));

// Token verification route
router.get('/verify-token', authController.verifyToken.bind(authController));

// Password reset request
router.post('/request-password-reset', authController.requestPasswordReset.bind(authController));

export default router;