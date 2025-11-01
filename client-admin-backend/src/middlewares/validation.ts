import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import Device from '../db/models/Device';

/**
 * validateRegister
 * Validates minimal fields required for user registration.
 * Note: deviceId is no longer accepted from the client. It is generated
 * server-side during registration to avoid conflicts and simplify UX.
 */
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateTransaction = [
  body('amount').isFloat({ min: 0.01 }),
  body('description').optional().trim(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validates login body: email, password length, and deviceId presence.
// For admins, deviceId will be optional and handled in AuthService.
export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * requireVerifiedDevice
 * Ensures the authenticated user has at least one verified device before
 * performing sensitive operations like deposits or withdrawals.
 * Admin users bypass this check.
 */
export async function requireVerifiedDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const authUser = (req as any).user as { userId: string; role?: string };

    // Allow admins to bypass device verification restrictions
    if (authUser?.role === 'admin') {
      return next();
    }

    // Check if the user has any verified device
    const verified = await Device.findOne({ where: { userId: authUser.userId, isVerified: true } });
    if (!verified) {
      return res.status(403).json({
        error: 'Device verification required for this operation. Please contact support to verify your device.',
      });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}