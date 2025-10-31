// client-app/backend/src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/client/AuthService';
import { UserDTO, DeviceDTO } from '../dtos';
import User from '../db/models/User';
import Device from '../db/models/Device';

export class AuthController {
  private authService = new AuthService();

  // Handles user registration; preserves `this` via arrow function.
  register = async (req: Request, res: Response) => {
    try {
      const { user, device } = await this.authService.register({
        ...req.body,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });

      res.status(201).json({
        message: 'Registration successful. Please wait for device verification.',
        user: new UserDTO(user),
        device: new DeviceDTO(device)
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Handles login; preserves `this` via arrow function.
  login = async (req: Request, res: Response) => {
    try {
      const { token, user, device } = await this.authService.login({
        ...req.body,
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });

      // Respond with normalized DTOs
      const response: any = {
        token,
        user: new UserDTO(user),
      };

      // Include device only if present (admins may not have one)
      if (device) {
        response.device = new DeviceDTO(device);
      }

      res.json(response);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  // Verifies JWT token; preserves `this` via arrow function.
  // Verifies JWT token; loads full User and Device by IDs, returns DTOs.
  verifyToken = async (req: Request, res: Response) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Decode JWT to get IDs; AuthService returns { userId, deviceId }
      const { userId, deviceId } = await this.authService.verifyToken(token);

      // Load User and Device models using primary keys
      const user = await User.findByPk(userId);
      const device = await Device.findByPk(deviceId);

      if (!user || !device) {
        return res.status(401).json({ error: 'Invalid token entities' });
      }

      // Respond with normalized DTOs
      res.json({
        user: new UserDTO(user),
        device: new DeviceDTO(device)
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}