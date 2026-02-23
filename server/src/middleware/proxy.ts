import { Request, Response } from 'express';
import { prisma } from '@utils/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@middleware/logger';
import { getMonthStart } from '@utils/date.util';

export const proxyHandler = async (req: Request, res: Response) => {
    const context = req.gatewayContext;
    if (!context) {
        res.status(500).json({ error: 'Gateway context missing' });
        return;
    }
    const { api, apiKey } = context;

    const startTime = Date.now();
    const pathParam = req.params.path;
    const targetPath = Array.isArray(pathParam) ? pathParam.join('/') : (pathParam || '');

    const queryString = req.url.split('?')[1] || '';
    const targetUrl = `${api.upstreamBaseUrl}/${targetPath}${queryString ? '?' + queryString : ''}`;

    const REQUEST_TIMEOUT_MS = 8000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        // Clean headers: join string arrays with commas (standard HTTP behavior)
        const cleanHeaders: Record<string, string> = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                cleanHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
            }
        });

        // Set mandatory upstream headers
        cleanHeaders['host'] = new URL(api.upstreamBaseUrl).host;
        cleanHeaders['x-forwarded-for'] = req.ip || '';
        delete cleanHeaders['x-api-key']; // Security: don't leak gateway key to upstream

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: cleanHeaders,
            body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
            signal: controller.signal
        });

        const responseData = await response.text();
        const endTime = Date.now();

        // 8. Usage Logging + Monthly Usage
        await prisma.$transaction(async (tx) => {
            await tx.usageLog.create({
                data: {
                    apiId: api.id,
                    apiKeyId: apiKey.id,
                    endpoint: targetPath,
                    method: req.method,
                    statusCode: response.status,
                    responseTime: endTime - startTime,
                } as unknown as Prisma.UsageLogUncheckedCreateInput
            });

            if (response.status < 400) {
                const monthStart = getMonthStart();
                await tx.monthlyUsage.upsert({
                    where: {
                        accountId_apiId_month: {
                            accountId: api.accountId,
                            apiId: api.id,
                            month: monthStart
                        }
                    },
                    create: {
                        accountId: api.accountId,
                        apiId: api.id,
                        month: monthStart,
                        totalRequests: 1n
                    },
                    update: {
                        totalRequests: { increment: 1n }
                    }
                });
            }
        });

        res.status(response.status).send(responseData);
    } catch (error) {
        logger.error('Proxy error', { error });
        res.status(502).json({ error: 'Bad Gateway' });
    } finally {
        clearTimeout(timeoutId);
    }
};
