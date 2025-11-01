import { Request, Response } from 'express';
import { AuthService } from '../services/client/AuthService';
import { UserDTO, DeviceDTO } from '../dtos';
import User from '../db/models/User';
import Device from '../db/models/Device';
import { ok, badRequest, unauthorized, serverError } from '../utils/responses';

export class AuthController {
  private authService = new AuthService();

   
  register = async (req: Request, res: Response) => {
    try {
      const { user, device } = await this.authService.register({
        ...req.body,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });

      return ok(res, {
        message: 'Registration successful. Please wait for device verification.',
        user: new UserDTO(user),
        device: new DeviceDTO(device)
      }, 201);
    } catch (error: any) {
      return badRequest(res, error.message);
    }
  };

 
  login = async (req: Request, res: Response) => {
    try {
    const { email, password } = req.body;
    console.log(`[AUTH DEBUG] Login attempt - Email: ${email}`);

    if (!email || !password) {
      return badRequest(res, 'Email and password are required.');
    }

    // Lookup user to provide clearer debug logs; device checks removed as login should not gate on device.
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[AUTH DEBUG] User not found: ${email}`);
      return unauthorized(res, 'Invalid credentials');
    }
    console.log(`[AUTH DEBUG] User found - Role: ${user.role}, ID: ${user.id}`);

    const result = await this.authService.login({
      email,
      password,
    });

    return ok(res, {
      token: result.token,
      user: new UserDTO(result.user),
    });
  } catch (error: any) {
    // 401 covers invalid creds and device policy violations
    return unauthorized(res, error.message);
  }
  };

 
  verifyToken = async (req: Request, res: Response) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return unauthorized(res, 'No token provided');
      }

      const { userId, deviceId } = await this.authService.verifyToken(token);

      const user = await User.findByPk(userId);
      if (!user) {
        return unauthorized(res, 'Invalid token entities');
      }

      let deviceDto: DeviceDTO | undefined;
      if (deviceId) {
        const device = await Device.findOne({ where: { deviceId } }); // Use deviceId column
        if (device) {
          deviceDto = new DeviceDTO(device);
        }
      } else {
        // New policy: include any verified device for the user if available
        const verified = await Device.findOne({ where: { userId, isVerified: true } });
        if (verified) {
          deviceDto = new DeviceDTO(verified);
        }
      }

      const response: any = { user: new UserDTO(user) };
      if (deviceDto) response.device = deviceDto;

      return ok(res, response);
    } catch (error: any) {
      return unauthorized(res, error.message);
    }
  };

  /**
   * requestPasswordReset
   * POST /api/auth/request-password-reset
   * Body: { email }
   * - Initiates a password reset by generating a temporary password.
   * - Returns a generic message and, in non-production, the temp password for demo/testing.
   */
  requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const { email } = req.body || {};
      if (!email) {
        return badRequest(res, 'Email is required.');
      }

      const result = await this.authService.requestPasswordReset(email);
      return ok(res, result);
    } catch (error: any) {
      return serverError(res, error);
    }
  };
}