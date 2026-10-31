const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
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

async function updatePlan(userId, plan) {
  if (!['FREE', 'PREMIUM'].includes(plan)) {
    const error = new Error('Invalid plan');
    error.status = 400;
    throw error;
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan },
    select: { id: true, email: true, name: true, role: true, plan: true, createdAt: true },
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

module.exports = { listUsers, createUser, updatePlan, deleteUser };
