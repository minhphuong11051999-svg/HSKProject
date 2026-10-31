require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  // Comma-separated list of allowed origins, e.g. "https://a.netlify.app,https://b.vercel.app"
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@hsk6.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
  },
};
