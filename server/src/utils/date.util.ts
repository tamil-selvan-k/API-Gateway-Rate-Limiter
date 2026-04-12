export const getMonthStart = (date: Date = new Date()): Date => {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
    return start;
};

export const getNextMonthStart = (date: Date = new Date()): Date => {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));
};
