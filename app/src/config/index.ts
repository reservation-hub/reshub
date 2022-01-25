export default {
  RESHUB_URL: process.env.RESHUB_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  ADMIN_URL: process.env.ADMIN_URL,
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET ?? 'SECRET',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
  MAILER_USER: process.env.MAIL_USER ?? '',
  MAILER_PASS: process.env.MAIL_PASS ?? '',
  REDIS_HOST: process.env.REDIS_HOST ?? '',
  REDIS_PORT: 6379,
}
