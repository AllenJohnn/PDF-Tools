import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many uploads, please try again in 15 minutes",
  skipSuccessfulRequests: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many API requests",
});
