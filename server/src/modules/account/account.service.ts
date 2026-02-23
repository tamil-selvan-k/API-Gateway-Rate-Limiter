import { AccountRepository } from './account.repository';
import { PasswordUtil } from '@utils/password.util';
import { JwtUtil } from '@utils/jwt.util';
import { AppError } from '@utils/AppError';
import { Prisma } from '@prisma/client';

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
        });

        const { password, ...accountWithoutPassword } = account as any;
        return accountWithoutPassword;
    }

    async login(email: string, password: string) {
        const account = await this.accountRepository.findByEmail(email);
        if (!account) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await PasswordUtil.compare(password, (account as any).password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const token = JwtUtil.generateToken({ id: account.id, email: account.email });

        const { password: _, ...accountWithoutPassword } = account as any;
        return { account: accountWithoutPassword, token };
    }

    async getProfile(id: string) {
        const account = await this.accountRepository.findById(id);
        if (!account) {
            throw new AppError('Account not found', 404);
        }

        const { password, ...accountWithoutPassword } = account as any;
        return accountWithoutPassword;
    }
}

