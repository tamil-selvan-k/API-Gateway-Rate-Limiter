import net from 'net';
import { AppError } from './AppError';

const INTERNAL_HOST_SUFFIXES = [
    '.local',
    '.internal',
    '.intranet',
    '.corp',
    '.lan',
    '.home',
    '.localdomain',
];

const isPrivateIpv4 = (ip: string) => {
    const [a, b] = ip.split('.').map((part) => Number(part));
    if ([a, b].some((part) => Number.isNaN(part))) {
        return false;
    }
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
};

const isPrivateIpv6 = (ip: string) => {
    const normalized = ip.toLowerCase();
    if (normalized === '::1') return true;
    if (normalized.startsWith('fe80:')) return true; // link-local
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local
    return false;
};

export const validateUpstreamBaseUrl = (value: string) => {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new AppError('Invalid upstream URL', 400);
    }

    if (url.protocol !== 'https:') {
        throw new AppError('Upstream URL must use HTTPS', 400);
    }

    if (url.username || url.password) {
        throw new AppError('Upstream URL must not include credentials', 400);
    }

    const hostname = url.hostname.toLowerCase();

    if (!hostname.includes('.')) {
        throw new AppError('Upstream URL must use a public hostname', 400);
    }

    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
        throw new AppError('Upstream URL cannot target localhost', 400);
    }

    if (INTERNAL_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
        throw new AppError('Upstream URL cannot target internal hostnames', 400);
    }

    const ipType = net.isIP(hostname);
    if (ipType === 4 && isPrivateIpv4(hostname)) {
        throw new AppError('Upstream URL cannot target private IP ranges', 400);
    }
    if (ipType === 6 && isPrivateIpv6(hostname)) {
        throw new AppError('Upstream URL cannot target private IP ranges', 400);
    }
};
