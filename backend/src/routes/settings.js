const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { readSettings, writeSettings } = require('../lib/settings');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json(await readSettings());
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
