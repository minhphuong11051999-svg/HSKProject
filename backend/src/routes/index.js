const { Router } = require('express');
const auth = require('./auth');
const lessons = require('./lessons');
const submissions = require('./submissions');
const adminLessons = require('./adminLessons');

const router = Router();

router.use('/auth', auth);
router.use('/lessons', lessons);
router.use('/submissions', submissions);
router.use('/admin/lessons', adminLessons);

module.exports = router;
