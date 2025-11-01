import { Request, Response, NextFunction } from 'express';
import { AuthService as ClientAuthService } from '../services/client/AuthService';
import User from '../db/models/User';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const authService = new ClientAuthService();
    const decoded = await authService.verifyToken(token);

    // Enforce that the user is still active on every request
    const dbUser = await User.findByPk(decoded.userId);
    if (!dbUser || !dbUser.isActive) {
      return res.status(403).json({ error: 'Account inactive. Please contact support.' });
    }

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};