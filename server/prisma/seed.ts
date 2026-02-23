import { PasswordUtil } from '../src/utils/password.util';
import { prisma } from '../src/config/prisma.config';


async function main() {
    console.log('Seeding database...');

    const adminPassword = await PasswordUtil.hash('admin123');

    // Create a default account
    const account = await prisma.account.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            id: 'enterprise_01',
            name: 'Enterprise Admin',
            email: 'admin@example.com',
            password: adminPassword,
        } as any,
    });


    console.log(`Created account: ${account.name}`);

    // Create default plans
    const plans = [
        {
            name: 'Free',
            monthlyRequestLimit: 10000,
            requestsPerSecond: 10,
            burstLimit: 20,
            monthlyPrice: 0,
            overagePricePerMillion: 0,
        },
        {
            name: 'Pro',
            monthlyRequestLimit: 1000000,
            requestsPerSecond: 100,
            burstLimit: 200,
            monthlyPrice: 20,
            overagePricePerMillion: 10,
        },
        {
            name: 'Unlimited',
            monthlyRequestLimit: 2147483647,
            requestsPerSecond: 1000,
            burstLimit: 2000,
            monthlyPrice: 100,
            overagePricePerMillion: 5,
        }
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: {},
            create: plan,
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
