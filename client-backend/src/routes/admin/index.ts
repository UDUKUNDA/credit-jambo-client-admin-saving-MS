import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/adminAuth';
import { AdminController } from '../../controllers/AdminController';

const router = Router();
const adminController = new AdminController();

// Admin-protected routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/users
 * Lists users (admin-only).
 */
router.get('/users', adminController.listUsers.bind(adminController));

/**
 * GET /api/admin/users/:id
 * Retrieves a single user (admin-only).
 */
router.get('/users/:id', adminController.getUser.bind(adminController));

export default router;