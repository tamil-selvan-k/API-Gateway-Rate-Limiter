import { prisma } from './src/config/prisma.config';

async function main() {
    const accounts = await prisma.account.findMany();
    console.log('Accounts:', JSON.stringify(accounts, null, 2));
    const plans = await prisma.plan.findMany();
    console.log('Plans:', JSON.stringify(plans, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
