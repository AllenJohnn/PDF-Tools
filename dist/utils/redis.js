"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCache = exports.getCache = exports.setCache = exports.cacheKey = exports.getRedis = exports.initRedis = void 0;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("./logger"));
let redisClient = null;
const initRedis = async () => {
    // Return early if Redis is disabled via environment variable
    if (process.env.REDIS_ENABLED === "false") {
        logger_1.default.info("Redis disabled - running without cache");
        return null;
    }
    try {
        redisClient = (0, redis_1.createClient)({
            socket: {
                host: process.env.REDIS_HOST || "127.0.0.1",
                port: parseInt(process.env.REDIS_PORT || "6379"),
                reconnectStrategy: () => new Error("Redis disabled"),
            },
        });
        redisClient.on("error", (error) => {
            logger_1.default.error("Redis error:", error);
            redisClient = null;
        });
        await redisClient.connect();
        logger_1.default.info("Redis connected");
        return redisClient;
    }
    catch (error) {
        logger_1.default.warn("Redis connection failed, running without cache:", error.message);
        redisClient = null;
        return null;
    }
};
exports.initRedis = initRedis;
const getRedis = () => redisClient;
exports.getRedis = getRedis;
const cacheKey = (prefix, id) => `${prefix}:${id}`;
exports.cacheKey = cacheKey;
const setCache = async (key, value, ttl = 3600) => {
    if (!redisClient)
        return false;
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return true;
    }
    catch (error) {
        logger_1.default.error("Cache set error:", error);
        return false;
    }
};
exports.setCache = setCache;
const getCache = async (key) => {
    if (!redisClient)
        return null;
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch (error) {
        logger_1.default.error("Cache get error:", error);
        return null;
    }
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    if (!redisClient)
        return false;
    try {
        await redisClient.del(key);
        return true;
    }
    catch (error) {
        logger_1.default.error("Cache delete error:", error);
        return false;
    }
};
exports.deleteCache = deleteCache;
//# sourceMappingURL=redis.js.map