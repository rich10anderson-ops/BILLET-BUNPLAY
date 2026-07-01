export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'fallback_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sesFromEmail: process.env.SES_FROM_EMAIL ?? 'noreply@billetbunplay.com',
  },
  exchangeRates: {
    baseUrl: process.env.FRANKFURTER_BASE_URL ?? 'https://api.frankfurter.app',
    ttlMinutes: parseInt(process.env.EXCHANGE_RATE_TTL_MINUTES ?? '60', 10),
  },
});
