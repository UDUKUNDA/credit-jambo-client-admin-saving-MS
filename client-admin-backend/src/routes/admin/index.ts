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

/**
 * GET /api/admin/users/:id/details
 * Retrieves user details including account, devices, transactions.
 */
router.get('/users/:id/details', adminController.getUserDetails.bind(adminController));

/**
 * PATCH /api/admin/users/:id/access
 * Toggle user access by setting isActive.
 */
router.patch('/users/:id/access', adminController.setUserAccess.bind(adminController));

/**
 * GET /api/admin/accounts
 */
router.get('/accounts', adminController.getAccounts.bind(adminController));

/**
 * GET /api/admin/transactions
 */
router.get('/transactions', adminController.getTransactions.bind(adminController));

/**
 * GET /api/admin/devices
 */
router.get('/devices', adminController.getDevices.bind(adminController));

/**
 * POST /api/admin/devices/:deviceId/verify
 */
router.post('/devices/:deviceId/verify', adminController.verifyDevice.bind(adminController));

/**
 * DELETE /api/admin/devices/:deviceId
 */
router.delete('/devices/:deviceId', adminController.deleteDevice.bind(adminController));

/**
 * POST /api/admin/users/:id/devices
 * Assign a new device to a user (optional body.deviceId)
 */
router.post('/users/:id/devices', adminController.assignDevice.bind(adminController));

/**
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

/**
 * GET /api/admin/stats
 */
router.get('/stats', adminController.getStats.bind(adminController));

export default router;