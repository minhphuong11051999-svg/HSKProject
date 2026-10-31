const { Router } = require('express');
const auth = require('./auth');
const lessons = require('./lessons');
const submissions = require('./submissions');
const samplePapers = require('./samplePapers');
const adminLessons = require('./adminLessons');
const adminUsers = require('./adminUsers');
const adminSamplePapers = require('./adminSamplePapers');

const router = Router();

router.use('/auth', auth);
router.use('/lessons', lessons);
router.use('/submissions', submissions);
router.use('/sample-papers', samplePapers);
router.use('/admin/lessons', adminLessons);
router.use('/admin/users', adminUsers);
router.use('/admin/sample-papers', adminSamplePapers);

module.exports = router;
