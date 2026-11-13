const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authenticate = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authorize = require('../middleware/authorize');
const { readSettings, writeSettings, publicSettings, discountMatches } = require('../lib/settings');

const router = Router();

router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const settings = await readSettings();
    res.json(req.user?.role === 'ADMIN' ? settings : publicSettings(settings));
  } catch (err) {
    next(err);
  }
});

// PRO page: checks a promo code without revealing the real one.
const discountLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
router.post('/discount', discountLimiter, async (req, res, next) => {
  try {
    const settings = await readSettings();
    res.json({ valid: discountMatches(settings, req.body?.code) });
  } catch (err) {
    next(err);
  }
});

router.put('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    res.json(await writeSettings(req.body));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
