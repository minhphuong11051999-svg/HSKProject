const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authorize = require('../middleware/authorize');

const router = Router();

const clip = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// "Góp ý" box: anyone may send, signed-in learners are linked to their account.
const sendLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
router.post('/', sendLimiter, optionalAuthenticate, async (req, res, next) => {
  try {
    const message = clip(req.body?.message, 3000);
    if (!message) return res.status(400).json({ message: 'Bạn hãy nhập nội dung góp ý.' });
    let name = clip(req.body?.name, 80) || null;
    let email = clip(req.body?.email, 120) || null;
    if (req.user) {
      const u = await prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true, email: true } });
      name = name || u?.name || null;
      email = email || u?.email || null;
    }
    await prisma.feedback.create({
      data: { userId: req.user?.id || null, name, email, message, page: clip(req.body?.page, 300) || null },
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    res.json(await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    res.json(await prisma.feedback.update({ where: { id: req.params.id }, data: { isRead: !!req.body?.isRead } }));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
