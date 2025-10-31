import { Request, Response, NextFunction } from 'express';
import { AuthService as ClientAuthService } from '../services/client/AuthService';
import User from '../db/models/User';

/**
 * authenticateAdmin
 * Verifies JWT and ensures the user has 'admin' role.
 * Uses DB check to avoid trusting only token payload.
 */
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const authService = new ClientAuthService();
    const decoded = await authService.verifyToken(token);

    const user = await User.findByPk(decoded.userId);
    if (!user || user.role !== 'admin' || !user.isActive) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as any).user = { userId: decoded.userId, role: user.role };
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};