const { Router } = require('express');
const auth = require('./auth');
const lessons = require('./lessons');
const submissions = require('./submissions');
const adminLessons = require('./adminLessons');
const adminUsers = require('./adminUsers');

const router = Router();

router.use('/auth', auth);
router.use('/lessons', lessons);
router.use('/submissions', submissions);
router.use('/admin/lessons', adminLessons);
router.use('/admin/users', adminUsers);

module.exports = router;
