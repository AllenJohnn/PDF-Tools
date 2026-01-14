import { RedisClientType } from "redis";
export declare const initRedis: () => Promise<RedisClientType | null>;
export declare const getRedis: () => RedisClientType | null;
export declare const cacheKey: (prefix: string, id: string) => string;
export declare const setCache: (key: string, value: any, ttl?: number) => Promise<boolean>;
export declare const getCache: (key: string) => Promise<any | null>;
export declare const deleteCache: (key: string) => Promise<boolean>;
//# sourceMappingURL=redis.d.ts.map