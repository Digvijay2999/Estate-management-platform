import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/estate_marketplace',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'development-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  appUrl: process.env.APP_URL ?? 'http://localhost:5000',
};
