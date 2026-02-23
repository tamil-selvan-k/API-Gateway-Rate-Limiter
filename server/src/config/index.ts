import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envSchema = z.object({
    PORT: z.string().default('3000').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    DATABASE_URL: z.string().url().optional(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_PORT: z.string().default('5432').transform(Number),
    DATABASE_NAME: z.string().optional(),
    DATABASE_USER: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_SSLMODE: z.string().default('require'),
    DATABASE_CHANNEL_BINDING: z.string().default('require'),

    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_SECRET: z.string().min(32),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
    console.error('Invalid environment variables:', JSON.stringify(envVars.error.format(), null, 2));
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Debug - JWT_SECRET length: ${process.env.JWT_SECRET?.length || 0}`);
    }
    process.exit(1);
}

type EnvVars = z.infer<typeof envSchema>;

const buildDatabaseUrl = (env: EnvVars): string => {
    if (env.DATABASE_URL) {
        return env.DATABASE_URL;
    }

    const missing: string[] = [];

    if (!env.DATABASE_HOST) missing.push('DATABASE_HOST');
    if (!env.DATABASE_NAME) missing.push('DATABASE_NAME');
    if (!env.DATABASE_USER) missing.push('DATABASE_USER');
    if (!env.DATABASE_PASSWORD) missing.push('DATABASE_PASSWORD');

    if (missing.length > 0) {
        throw new Error(
            `DATABASE_URL is missing and database parts are incomplete. Missing: ${missing.join(', ')}`,
        );
    }

    const query = new URLSearchParams({
        sslmode: env.DATABASE_SSLMODE,
        channel_binding: env.DATABASE_CHANNEL_BINDING,
    });

    return `postgresql://${encodeURIComponent(env.DATABASE_USER as string)}:${encodeURIComponent(env.DATABASE_PASSWORD as string)}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}?${query.toString()}`;
};

let databaseUrl = '';

try {
    databaseUrl = buildDatabaseUrl(envVars.data);
} catch (error) {
    console.error((error as Error).message);
    process.exit(1);
}

export const config = {
    port: envVars.data.PORT,
    nodeEnv: envVars.data.NODE_ENV,
    database: {
        url: databaseUrl,
    },
    redis: {
        url: envVars.data.REDIS_URL,
    },
    jwt: {
        secret: envVars.data.JWT_SECRET,
    },
};
