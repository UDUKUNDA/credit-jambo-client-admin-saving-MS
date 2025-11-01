import { Request, Response } from 'express';
import { AccountService } from '../services/client/AccountService';
import { AccountDTO, TransactionDTO } from '../dtos';
import { ok, serverError, badRequest } from '../utils/responses';

export class AccountController {
  private accountService = new AccountService();

  async getBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const account = await this.accountService.getAccount(userId);
      return ok(res, new AccountDTO(account));
    } catch (error: any) {
      return serverError(res, error);
    }
  }

  async deposit(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, description } = req.body;

      const transaction = await this.accountService.deposit(userId, amount, description);
      return ok(res, new TransactionDTO(transaction));
    } catch (error: any) {
      return badRequest(res, error.message);
    }
  }

  async withdraw(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { amount, description } = req.body;

      const transaction = await this.accountService.withdraw(userId, amount, description);
      return ok(res, new TransactionDTO(transaction));
    } catch (error: any) {
      return badRequest(res, error.message);
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

      return ok(res, {
        transactions: result.transactions.map(t => new TransactionDTO(t)),
        total: result.total
      });
    } catch (error: any) {
      return serverError(res, error);
    }
  }
}