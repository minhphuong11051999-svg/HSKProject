const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { effectivePlan } = require('./plan');

function signAccessToken(user) {
  const payload = { sub: user.id, role: user.role, plan: effectivePlan(user) };
  if (payload.plan === 'PREMIUM' && user.planExpiresAt) payload.pexp = new Date(user.planExpiresAt).getTime();
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
