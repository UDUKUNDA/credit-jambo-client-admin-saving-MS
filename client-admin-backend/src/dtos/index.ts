import User from '../db/models/User';
import Device from '../db/models/Device';
import Account from '../db/models/Account';
import Transaction from '../db/models/Transaction';

export class UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: Date;

  constructor(user: Partial<User> | any) {
    this.id = String((user as any).id);
    this.email = (user as any).email;
    this.firstName = (user as any).firstName;
    this.lastName = (user as any).lastName;
    this.role = (user as any).role;
    this.isActive = (user as any).isActive;
    this.createdAt = (user as any).createdAt;
  }
}

export class DeviceDTO {
  id: string;
  deviceId: string;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;

  constructor(device: Partial<Device> | any) {
    this.id = String((device as any).id);
    this.deviceId = (device as any).deviceId;
    this.isVerified = Boolean((device as any).isVerified);
    this.lastLogin = (device as any).lastLogin;
    this.createdAt = (device as any).createdAt;
  }
}

export class AccountDTO {
  id: string;
  balance: number;
  currency: string;
  createdAt?: Date;

  constructor(account: Partial<Account> | any) {
    this.id = String((account as any).id);
    this.balance = parseFloat(String((account as any).balance ?? 0));
    this.currency = (account as any).currency ?? 'USD';
    this.createdAt = (account as any).createdAt;
  }
}

export class TransactionDTO {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt?: Date;

  constructor(transaction: Partial<Transaction> | any) {
    this.id = String((transaction as any).id);
    this.type = (transaction as any).type;
    this.amount = parseFloat(String((transaction as any).amount ?? 0));
    this.balanceBefore = parseFloat(String((transaction as any).balanceBefore ?? 0));
    this.balanceAfter = parseFloat(String((transaction as any).balanceAfter ?? 0));
    this.description = (transaction as any).description;
    this.status = (transaction as any).status;
    this.createdAt = (transaction as any).createdAt;
  }
}

export default {
  UserDTO,
  DeviceDTO,
  AccountDTO,
  TransactionDTO,
};