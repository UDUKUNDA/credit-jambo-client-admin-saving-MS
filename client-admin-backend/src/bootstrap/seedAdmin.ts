import { createHash } from 'crypto';
import User from '../db/models/User';
import Device from '../db/models/Device';

/**
 * hashPassword
 * Produces a sha512 hash of the password combined with PASSWORD_SALT.
 */
function hashPassword(password: string): string {
  return createHash('sha512')
    .update(password)
    .update(process.env.PASSWORD_SALT!)
    .digest('hex');
}

/**
 * seedAdminUser
 * Ensures an admin user exists and seeds a verified admin device.
 * Uses ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_DEVICE_ID from environment variables.
 */
export async function seedAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL as string;
  const password = process.env.ADMIN_PASSWORD as string;
  const adminDeviceId = process.env.ADMIN_DEVICE_ID as string;

  // Try to find the existing admin user
  const existing = await User.findOne({ where: { email, role: 'admin' } });

  if (existing) {
    console.log(`[CLIENT SEED] Admin already exists: ${email}`);

    // Ensure admin device exists and is verified
    const existingDevice = await Device.findOne({
      where: { userId: existing.id, deviceId: adminDeviceId },
    });

    if (existingDevice) {
      if (!existingDevice.isVerified) {
        existingDevice.isVerified = true;
        await existingDevice.save();
        console.log(`[CLIENT SEED] Verified existing admin device: ${adminDeviceId}`);
      } else {
        console.log(`[CLIENT SEED] Admin device already present: ${adminDeviceId}`);
      }
    } else {
      await Device.create({
        userId: existing.id,
        deviceId: adminDeviceId,
        isVerified: true,
      });
      console.log(`[CLIENT SEED] Seeded admin device: ${adminDeviceId}`);
    }
    return;
  }

  const hashed = hashPassword(password);

  // Transaction: create admin user and device together
  const tx = await User.sequelize!.transaction();
  try {
    const adminUser = await User.create(
      {
        email,
        password: hashed,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
      },
      { transaction: tx }
    );

    await Device.create(
      {
        userId: adminUser.id,
        deviceId: adminDeviceId,
        isVerified: true,
      },
      { transaction: tx }
    );

    await tx.commit();
    console.log(`[CLIENT SEED] Seeded admin user: ${email} and device: ${adminDeviceId}`);
  } catch (err) {
    await tx.rollback();
    console.error('[CLIENT SEED] Failed to seed admin user/device:', err);
  }
}