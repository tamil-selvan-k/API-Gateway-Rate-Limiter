export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 10;

const toInt = (value: unknown): number | null => {
    if (value === undefined || value === null) return null;
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) return null;
    return Math.trunc(numeric);
};

export const normalizePagination = (offset?: unknown, limit?: unknown) => {
    const parsedOffset = toInt(offset);
    const parsedLimit = toInt(limit);

    return {
        offset: parsedOffset !== null && parsedOffset >= 0 ? parsedOffset : DEFAULT_OFFSET,
        limit: parsedLimit !== null && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT,
    };
};
