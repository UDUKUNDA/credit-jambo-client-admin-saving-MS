// client-app/backend/src/services/AccountService.ts
import { Op } from 'sequelize';
import Account from '../../db/models/Account';
import Transaction from '../../db/models/Transaction';
import User from '../../db/models/User';

export class AccountService {
  async getAccount(userId: string): Promise<Account> {
    let account = await Account.findOne({ where: { userId } });
    
    if (!account) {
      account = await Account.create({
        userId,
        balance: 0,
        currency: 'USD',
      });
    }

    return account;
  }

  async deposit(userId: string, amount: number, description: string = 'Deposit'): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const transaction = await Account.sequelize!.transaction();

    try {
      const account = await this.getAccount(userId);
      const balanceBefore = parseFloat(account.balance.toString());

      account.balance = parseFloat(account.balance.toString()) + amount;
      await account.save({ transaction });

      const transactionRecord = await Transaction.create(
        {
          accountId: account.id,
          type: 'DEPOSIT',
          amount,
          balanceBefore,
          balanceAfter: parseFloat(account.balance.toString()),
          description,
          status: 'COMPLETED',
        },
        { transaction }
      );

      await transaction.commit();
      return transactionRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async withdraw(userId: string, amount: number, description: string = 'Withdrawal'): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const transaction = await Account.sequelize!.transaction();

    try {
      const account = await this.getAccount(userId);
      const balanceBefore = parseFloat(account.balance.toString());

      if (balanceBefore < amount) {
        throw new Error('Insufficient funds');
      }

      account.balance = balanceBefore - amount;
      await account.save({ transaction });

      const transactionRecord = await Transaction.create(
        {
          accountId: account.id,
          type: 'WITHDRAWAL',
          amount,
          balanceBefore,
          balanceAfter: parseFloat(account.balance.toString()),
          description,
          status: 'COMPLETED',
        },
        { transaction }
      );

      await transaction.commit();
      return transactionRecord;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTransactionHistory(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const account = await this.getAccount(userId);
    
    const { count, rows } = await Transaction.findAndCountAll({
      where: { accountId: account.id },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: Account,
          as: 'account',
          attributes: ['id', 'balance'],
        },
      ],
    });

    return { transactions: rows, total: count };
  }

  async getAccountWithUser(userId: string): Promise<Account | null> {
    return await Account.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });
  }
}