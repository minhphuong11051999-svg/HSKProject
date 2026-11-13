const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { isExpired } = require('../lib/plan');

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      planExpiresAt: true,
      createdAt: true,
      _count: { select: { submissions: true } },
    },
  });

  return users.map(({ _count, ...user }) => ({ ...user, submissionCount: _count.submissions }));
}

async function createUser({ email, password, name, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: role === 'ADMIN' ? 'ADMIN' : 'USER' },
  });

  const { passwordHash: _, ...rest } = user;
  return { ...rest, submissionCount: 0 };
}

// days: length of the PRO period (15, 30, 90…). Buying again while PRO is still
// running adds the days on top of the current end date. No days = no end date.
async function updatePlan(userId, plan, days) {
  if (!['FREE', 'PREMIUM'].includes(plan)) {
    const error = new Error('Invalid plan');
    error.status = 400;
    throw error;
  }
  const n = Number(days);
  if (days != null && days !== '' && (!Number.isInteger(n) || n < 1 || n > 3660)) {
    const error = new Error('Số ngày không hợp lệ');
    error.status = 400;
    throw error;
  }
  let planExpiresAt = null;
  if (plan === 'PREMIUM' && days != null && days !== '') {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true, planExpiresAt: true } });
    const running = current?.plan === 'PREMIUM' && current.planExpiresAt && !isExpired(current.planExpiresAt);
    const start = running ? new Date(current.planExpiresAt).getTime() : Date.now();
    planExpiresAt = new Date(start + n * 24 * 60 * 60 * 1000);
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan, planExpiresAt },
    select: { id: true, email: true, name: true, role: true, plan: true, planExpiresAt: true, createdAt: true },
  });
  return user;
}

async function deleteUser(userId, requestingUserId) {
  if (userId === requestingUserId) {
    const error = new Error('Cannot delete your own account');
    error.status = 400;
    throw error;
  }
  await prisma.user.delete({ where: { id: userId } });
}

// "Quên mật khẩu" has no email flow: the learner contacts the admin, who sets a new one here.
async function resetPassword(userId, password) {
  if (!password || String(password).length < 8) {
    const error = new Error('Mật khẩu mới cần tối thiểu 8 ký tự.');
    error.status = 400;
    throw error;
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

module.exports = { listUsers, createUser, updatePlan, deleteUser, resetPassword };
