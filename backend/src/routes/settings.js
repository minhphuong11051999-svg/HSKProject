const { Router } = require('express');
const prisma = require('../lib/prisma');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Site-wide switches flipped by the admin. Only keys listed here are readable/writable.
const DEFAULTS = { showUpcomingLessons: false };

async function readAll() {
  const rows = await prisma.appSetting.findMany({ where: { key: { in: Object.keys(DEFAULTS) } } });
  return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), { ...DEFAULTS });
}

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await readAll());
  } catch (err) {
    next(err);
  }
});

router.put('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const entries = Object.entries(req.body || {}).filter(([k]) => k in DEFAULTS);
    for (const [key, value] of entries) {
      await prisma.appSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
    }
    res.json(await readAll());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
