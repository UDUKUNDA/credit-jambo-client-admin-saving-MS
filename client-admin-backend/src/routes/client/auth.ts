// backend/src/routes/client/auth.ts
import { Router } from 'express';
import { AuthController } from '../../controllers/AuthController';
import { validateRegister, validateLogin } from '../../middlewares/validation';

const router = Router();
const authController = new AuthController();

// Registration route
// Bind the controller instance to preserve `this` (authService, etc.)
router.post('/register', validateRegister, authController.register.bind(authController));

// Login route  
router.post('/login', validateLogin, authController.login.bind(authController));

// Token verification route
router.get('/verify-token', authController.verifyToken.bind(authController));

export default router;