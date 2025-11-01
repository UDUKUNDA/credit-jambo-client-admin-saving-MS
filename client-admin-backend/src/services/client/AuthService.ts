import { createHash, randomBytes } from 'crypto';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import User from '../../db/models/User';
import Device from '../../db/models/Device';
import Account from '../../db/models/Account';
interface LoginRequest {
 email: string;
  password: string;
  deviceId?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // DeviceId is no longer provided by the client; we generate server-side
  deviceId?: string;
  // Optional meta captured from controller for audit/diagnostics
  userAgent?: string;
  ipAddress?: string;
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

      // Generate a random, globally unique deviceId server-side.
      // This avoids tying registration to the actual browser/computer.
      let generatedId = '';
      // Try a few times to avoid rare collisions
      for (let i = 0; i < 5; i++) {
        generatedId = randomBytes(16).toString('hex');
        const collision = await Device.findOne({ where: { deviceId: generatedId }, transaction });
        if (!collision) break;
        generatedId = '';
      }
      if (!generatedId) {
        // Final fallback if collisions persist (extremely unlikely)
        generatedId = `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
      }

      const device = await Device.create(
        {
          userId: user.id,
          deviceId: generatedId,
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
   * Authenticates a user by email/password and enforces device verification.
   * - If the user has no verified device records, login is denied.
   * - Token includes userId and role; deviceId is not required for login.
   */
  async login(data: LoginRequest): Promise<{ token: string; user: User }> {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const hashedPassword = this.hashPassword(data.password);
    if (user.password !== hashedPassword) {
      throw new Error('Invalid credentials');
    }

    // Enforce device verification at login: user must have at least one verified device
    const hasVerifiedDevice = await Device.findOne({ where: { userId: user.id, isVerified: true } });
    if (!hasVerifiedDevice) {
      throw new Error('Device verification required. Please wait for admin approval.');
    }

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'],
    };

    const tokenPayload: any = { userId: user.id, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as Secret, signOptions);
    return { token, user };
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

  /**
   * requestPasswordReset
   * Generates a temporary password and updates the user's password.
   * - Accepts an email, returns a generic success message to avoid user enumeration.
   * - In non-production, returns the temporary password for developer convenience.
   */
  async requestPasswordReset(email: string): Promise<{ message: string; tempPassword?: string }> {
    // Attempt to find the user by email
    const user = await User.findOne({ where: { email } });

    // Always return a generic message to avoid leaking which emails exist
    const genericMessage = 'If the email is registered, a reset has been initiated.';

    if (!user) {
      return { message: genericMessage };
    }

    // Create a temporary password (12 hex chars) and hash it with the configured salt
    const tempPassword = randomBytes(6).toString('hex');
    const hashed = this.hashPassword(tempPassword);

    user.password = hashed;
    await user.save();

    // Only expose the temp password in non-production environments for testing/demo
    const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    return isProd
      ? { message: genericMessage }
      : { message: genericMessage, tempPassword };
  }
}