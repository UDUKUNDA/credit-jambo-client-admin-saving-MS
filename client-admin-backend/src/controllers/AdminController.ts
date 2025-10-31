import { Request, Response } from 'express';
import User from '../db/models/User';

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

      res.json({ total: count, users: rows });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}