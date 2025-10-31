// client-app/backend/src/controllers/AccountController.ts
import { Request, Response } from 'express';
import { AccountService } from '../services/client/AccountService';
import { AccountDTO, TransactionDTO } from '../dtos';

export class AccountController {
  private accountService = new AccountService();

  async getBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const account = await this.accountService.getAccount(userId);
      res.json(new AccountDTO(account));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deposit(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, description } = req.body;

      const transaction = await this.accountService.deposit(userId, amount, description);
      res.json(new TransactionDTO(transaction));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async withdraw(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, description } = req.body;

      const transaction = await this.accountService.withdraw(userId, amount, description);
      res.json(new TransactionDTO(transaction));
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { limit = 50, offset = 0 } = req.query;

      const result = await this.accountService.getTransactionHistory(
        userId, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      res.json({
        transactions: result.transactions.map(t => new TransactionDTO(t)),
        total: result.total
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}