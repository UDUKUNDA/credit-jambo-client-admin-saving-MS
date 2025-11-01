import { Request, Response } from 'express';
import User from '../db/models/User';
import Device from '../db/models/Device';
import Account from '../db/models/Account';
import Transaction from '../db/models/Transaction';
import { Op } from 'sequelize';
import sequelize from '../db/config';
import { ok, serverError, badRequest, notFound } from '../utils/responses';

/**
 * AdminController
 * Provides admin-only endpoints for managing users and viewing data.
 */
export class AdminController {
  /**
   * listUsers
   * Lists users with simple pagination, hides password field.
   */
  async listUsers(req: Request, res: Response) {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return ok(res, { total: count, users: rows });
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * setUserAccess
   * Allows admin to deny or restore a user's access by toggling `isActive`.
   * Body: { isActive: boolean }
   */
  async setUserAccess(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body as { isActive?: boolean };

      if (typeof isActive !== 'boolean') {
        return badRequest(res, 'isActive boolean is required');
      }

      const user = await User.findByPk(id);
      if (!user) {
        return notFound(res, 'User not found');
      }

      user.isActive = isActive;
      await user.save();

      const safeUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      return ok(res, { message: isActive ? 'Access restored' : 'Access denied', user: safeUser });
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * getUser
   * Returns a single user by ID, hides password field.
   */
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return notFound(res, 'User not found');
      }

      return ok(res, user);
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * getUserDetails
   * Returns user profile, account, devices, and transactions for admin review.
   */
  async getUserDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!user) {
        return notFound(res, 'User not found');
      }

      const account = await Account.findOne({ where: { userId: id } });
      const devices = await Device.findAll({ where: { userId: id }, order: [['createdAt', 'DESC']] });

      let transactions: Transaction[] = [];
      if (account?.id) {
        transactions = await Transaction.findAll({
          where: { accountId: account.id },
          order: [['createdAt', 'DESC']],
        });
      }

      return ok(res, { user, account, devices, transactions });
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * getAccounts
   * Lists accounts with associated user email for admin.
   */
  async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await Account.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'email'] }],
        order: [['createdAt', 'DESC']],
      });
      return ok(res, accounts);
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * getTransactions
   * Lists transactions with optional filters: type, status, userId.
   */
  async getTransactions(req: Request, res: Response) {
    try {
      const type = req.query.type ? String(req.query.type) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const userId = req.query.userId ? String(req.query.userId) : undefined;

      const where: any = {};
      if (type) where.type = type;
      if (status) where.status = status;

      let accountFilter: any = {};
      if (userId) accountFilter.userId = userId;

      const txs = await Transaction.findAll({
        where,
        include: [{ model: Account, as: 'account', where: accountFilter }],
        order: [['createdAt', 'DESC']],
      });
      return ok(res, txs);
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * getDevices
   * Lists devices; can filter by userId.
   */
  async getDevices(req: Request, res: Response) {
    try {
      const userId = req.query.userId ? String(req.query.userId) : undefined;
      const where: any = {};
      if (userId) where.userId = userId;

      const devices = await Device.findAll({ where, order: [['createdAt', 'DESC']] });
      return ok(res, devices);
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * verifyDevice
   * Marks a device record as verified by deviceId.
   */
  async verifyDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const device = await Device.findOne({ where: { deviceId } });
      if (!device) {
        return notFound(res, 'Device not found');
      }

      device.isVerified = true;
      await device.save();
      return ok(res, { message: 'Device verified', device });
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * deleteDevice
   * Deletes a device by its deviceId.
   */
  async deleteDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const device = await Device.findOne({ where: { deviceId } });
      if (!device) {
        return notFound(res, 'Device not found');
      }

      await device.destroy();
      return ok(res, { message: 'Device deleted', deviceId });
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * assignDevice
   * Creates and assigns a new device to a user. If deviceId is not provided,
   * a random development deviceId is generated.
   * Body: { deviceId?: string, isVerified?: boolean }
   */
  async assignDevice(req: Request, res: Response) {
    try {
      const { id: userId } = req.params;
      const { deviceId: providedDeviceId, isVerified } = req.body as { deviceId?: string; isVerified?: boolean };

      const user = await User.findByPk(userId);
      if (!user) {
        return notFound(res, 'User not found');
      }

      const deviceId = providedDeviceId && String(providedDeviceId).trim().length > 0
        ? String(providedDeviceId).trim()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      // Enforce unique per userId + deviceId
      const existing = await Device.findOne({ where: { userId, deviceId } });
      if (existing) {
        return badRequest(res, 'Device with this ID already exists for the user');
      }

      const device = await Device.create({ userId, deviceId, isVerified: !!isVerified });
      return ok(res, { message: 'Device assigned', device }, 201);
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  /**
   * deleteUser
   * Deletes a user and related account, transactions, and devices.
   */
  async deleteUser(req: Request, res: Response) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        await t.rollback();
        return notFound(res, 'User not found');
      }

      // Delete devices
      await Device.destroy({ where: { userId: id }, transaction: t });

      // Delete account and transactions
      const account = await Account.findOne({ where: { userId: id } });
      if (account) {
        await Transaction.destroy({ where: { accountId: account.id }, transaction: t });
        await account.destroy({ transaction: t });
      }

      // Delete user
      await user.destroy({ transaction: t });
      await t.commit();

      return ok(res, { message: 'User and related data deleted', userId: id });
    } catch (error: any) {
      await t.rollback();
      return serverError(res, error);
    }
  }

  /**
   * getStats
   * Aggregates counts and sums across users, devices, accounts, transactions.
   */
  async getStats(req: Request, res: Response) {
    try {
      const [usersCount, devicesTotal, devicesVerified, accountsTotal, balancesSum, txTotal, depositsSum, withdrawalsSum] = await Promise.all([
        User.count(),
        Device.count(),
        Device.count({ where: { isVerified: true } }),
        Account.count(),
        Account.sum('balance'),
        Transaction.count(),
        Transaction.sum('amount', { where: { type: 'DEPOSIT', status: 'COMPLETED' } }),
        Transaction.sum('amount', { where: { type: 'WITHDRAWAL', status: 'COMPLETED' } }),
      ]);

      return ok(res, {
        usersCount,
        devices: { total: devicesTotal, verified: devicesVerified },
        accounts: { total: accountsTotal, balanceSum: balancesSum || 0 },
        transactions: { total: txTotal, depositsTotal: depositsSum || 0, withdrawalsTotal: withdrawalsSum || 0 },
      });
    } catch (error: any) {
      return serverError(res, error);
    }
  }
}