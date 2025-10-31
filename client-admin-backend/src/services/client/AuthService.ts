import { createHash } from 'crypto';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User from '../../db/models/User';
import Device from '../../db/models/Device';
import Account from '../../db/models/Account';
interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  deviceId: string;
   
}

export class AuthService {
  private hashPassword(password: string): string {
    return createHash('sha512').update(password).update(process.env.PASSWORD_SALT!).digest('hex');
  }

  async register(data: RegisterRequest): Promise<{ user: User; device: Device }> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const transaction = await User.sequelize!.transaction();

    try {
      const user = await User.create(
        {
          email: data.email,
          password: this.hashPassword(data.password),
          firstName: data.firstName,
          lastName: data.lastName,
        },
        { transaction }
      );

      const device = await Device.create(
        {
          userId: user.id,
          deviceId: data.deviceId,
        },
        { transaction }
      );

      await Account.create(
        {
          userId: user.id,
          balance: 0,
          currency: 'USD',
        },
        { transaction }
      );

      await transaction.commit();
      return { user, device };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * login
   * Authenticates user and enforces device rules:
   * - Admins: deviceId is required; if device missing, auto-create and verify.
   * - Users: deviceId is required; device must exist and be verified.
   */
  async login(data: LoginRequest): Promise<{ token: string; user: User; device: Device }> {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const hashedPassword = this.hashPassword(data.password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid credentials');
    }

    // Require deviceId for all logins
    if (!data.deviceId) {
      throw new Error('Device ID is required');
    }

    let device = await Device.findOne({
      where: { userId: user.id, deviceId: data.deviceId },
    });

    if (!device) {
      if (user.role === 'admin') {
        // Auto-create a verified device for admin
        device = await Device.create({
          userId: user.id,
          deviceId: data.deviceId,
          isVerified: true,
        });
      } else {
        throw new Error('Device not registered');
      }
    } else if (!device.isVerified) {
      if (user.role === 'admin') {
        device.isVerified = true;
      } else {
        throw new Error('Device pending verification');
      }
    }

 

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
    };

    // Include role to help frontends route; admin routes still verify DB-side
    const token = jwt.sign(
      { userId: user.id, deviceId: device.id, role: user.role },
      process.env.JWT_SECRET as Secret,
      signOptions
    );

    return { token, user, device };
  }

  /**
   * verifyToken
   * Decodes JWT; returns userId and optional deviceId and role.
   */
  async verifyToken(token: string): Promise<{ userId: string; deviceId?: string; role?: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return { userId: decoded.userId, deviceId: decoded.deviceId, role: decoded.role };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async getDeviceVerificationStatus(userId: string, deviceId: string): Promise<boolean> {
    const device = await Device.findOne({
      where: { userId, deviceId },
    });
    
    return device ? device.isVerified : false;
  }
}