import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
export const securityHeaders = helmet();

export const authLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 second s
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});