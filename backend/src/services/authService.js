const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { effectivePlan } = require('../lib/plan');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../lib/tokens');

async function register({ email, password, name }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  return buildAuthResult(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  return buildAuthResult(user);
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const error = new Error('Invalid or expired refresh token');
    error.status = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 401;
    throw error;
  }

  return buildAuthResult(user);
}

function buildAuthResult(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    plan: effectivePlan(user),
    planExpiresAt: user.plan === 'PREMIUM' ? user.planExpiresAt ?? null : null,
  };
}

function badRequest(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Learner's own profile: only the display name is editable here.
async function updateProfile(userId, { name }) {
  const clean = String(name ?? '').trim();
  if (!clean) throw badRequest('Vui lòng nhập họ tên.');
  if (clean.length > 80) throw badRequest('Họ tên tối đa 80 ký tự.');
  const user = await prisma.user.update({ where: { id: userId }, data: { name: clean } });
  return toPublicUser(user);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  if (!newPassword || String(newPassword).length < 8) throw badRequest('Mật khẩu mới cần tối thiểu 8 ký tự.');
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw badRequest('User not found', 404);
  const valid = await bcrypt.compare(String(currentPassword ?? ''), user.passwordHash);
  if (!valid) throw badRequest('Mật khẩu hiện tại không đúng.');
  const passwordHash = await bcrypt.hash(String(newPassword), 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

module.exports = { register, login, refresh, toPublicUser, updateProfile, changePassword };
