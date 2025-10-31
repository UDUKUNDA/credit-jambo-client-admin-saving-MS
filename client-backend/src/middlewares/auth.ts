// backend/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService as ClientAuthService } from '../services/client/AuthService';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const authService = new ClientAuthService();
    const decoded = await authService.verifyToken(token);
    
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};