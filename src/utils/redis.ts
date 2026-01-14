import { createClient, RedisClientType } from "redis";
import logger from "./logger";

let redisClient: RedisClientType | null = null;

export const initRedis = async (): Promise<RedisClientType | null> => {
  // Return early if Redis is disabled via environment variable
  if (process.env.REDIS_ENABLED === "false") {
    logger.info("Redis disabled - running without cache");
    return null;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        reconnectStrategy: () => new Error("Redis disabled"),
      },
    });

    redisClient.on("error", (error) => {
      logger.error("Redis error:", error);
      redisClient = null;
    });

    await redisClient.connect();
    logger.info("Redis connected");
    return redisClient;
  } catch (error: any) {
    logger.warn("Redis connection failed, running without cache:", error.message);
    redisClient = null;
    return null;
  }
};

export const getRedis = (): RedisClientType | null => redisClient;

export const cacheKey = (prefix: string, id: string): string => `${prefix}:${id}`;

export const setCache = async (key: string, value: any, ttl = 3600): Promise<boolean> => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error("Cache set error:", error);
    return false;
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  if (!redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error("Cache get error:", error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<boolean> => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error("Cache delete error:", error);
    return false;
  }
};
