export default {
  JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET ?? 'SECRET',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? '',
}
