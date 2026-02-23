export const getMonthStart = (date: Date = new Date()): Date => {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
};
