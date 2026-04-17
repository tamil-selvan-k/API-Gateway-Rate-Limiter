import workerpool from 'workerpool';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const generateToken = (message: { payload: { id: string; email: string }; secret: string }) => {
    return jwt.sign(message.payload, message.secret, {
        expiresIn: '7d',
    });
};

const verifyToken = (message: { token: string; secret: string }) => {
    return jwt.verify(message.token, message.secret);
};

const hashApiKey = (message: { key: string }) => {
    return crypto.createHash('sha256').update(message.key).digest('hex');
};

const randomHex = (message: { bytes: number; prefix?: string }) => {
    return String(message.prefix || '') + crypto.randomBytes(message.bytes).toString('hex');
};

const hashPassword = async (message: { password: string; saltRounds: number }) => {
    return bcrypt.hash(message.password, message.saltRounds);
};

const comparePassword = async (message: { password: string; hash: string }) => {
    return bcrypt.compare(message.password, message.hash);
};

// Register methods to the worker pool
workerpool.worker({
    generateToken,
    verifyToken,
    hashApiKey,
    randomHex,
    hashPassword,
    comparePassword,
});
