import { AccountRepository } from './account.repository';
import { PasswordUtil } from '@utils/password.util';
import { JwtUtil } from '@utils/jwt.util';
import { AppError } from '@utils/AppError';
import { Prisma } from '@prisma/client';

// Define local interface for Account to handle stale Prisma client types
interface AccountModel {
    id: string;
    email: string;
    password?: string;
    isActive: boolean;
    name: string;
}

export class AccountService {
    constructor(private accountRepository: AccountRepository) { }

    async register(data: Omit<Prisma.AccountCreateInput, 'password'> & { password: string }) {
        const existingAccount = await this.accountRepository.findByEmail(data.email);
        if (existingAccount) {
            throw new AppError('Account with this email already exists', 400);
        }

        const hashedPassword = await PasswordUtil.hash(data.password);

        const account = await this.accountRepository.create({
            ...data,
            password: hashedPassword,
        }) as unknown as AccountModel;

        const { password, ...accountWithoutPassword } = account;
        return accountWithoutPassword;
    }

    async login(email: string, password: string) {
        const account = await this.accountRepository.findByEmail(email) as unknown as AccountModel | null;
        if (!account) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await PasswordUtil.compare(password, account.password || '');
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = JwtUtil.generateToken({ id: account.id, email: account.email });

        const { password: _, ...accountWithoutPassword } = account;
        return { account: accountWithoutPassword, token };
    }

    async getProfile(id: string) {
        const account = await this.accountRepository.findById(id) as unknown as AccountModel | null;
        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        const { password, ...accountWithoutPassword } = account;
        return accountWithoutPassword;
    }

    async updateProfile(id: string, data: Partial<Prisma.AccountUpdateInput>) {
        // Prevent password update through this method
        const { password: _, isActive, ...updateData } = data as Record<string, unknown>;

        const account = await this.accountRepository.update(id, updateData as Prisma.AccountUpdateInput) as unknown as AccountModel;
        const { password, ...accountWithoutPassword } = account;
        return accountWithoutPassword;
    }

    async softDelete(id: string) {
        return this.accountRepository.update(id, { isActive: false } as Prisma.AccountUpdateInput);
    }

    async changePassword(id: string, currentPassword: string, newPassword: string) {
        const account = await this.accountRepository.findById(id) as unknown as AccountModel | null;
        if (!account || !account.isActive) {
            throw new AppError('Account not found or inactive', 404);
        }

        const isPasswordValid = await PasswordUtil.compare(currentPassword, account.password || '');
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 400);
        }

        const hashedPassword = await PasswordUtil.hash(newPassword);
        await this.accountRepository.update(id, { password: hashedPassword } as Prisma.AccountUpdateInput);
    }
}



