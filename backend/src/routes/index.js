const { Router } = require('express');
const auth = require('./auth');
const lessons = require('./lessons');
const submissions = require('./submissions');
const samplePapers = require('./samplePapers');
const examSittings = require('./examSittings');
const adminLessons = require('./adminLessons');
const adminUsers = require('./adminUsers');
const adminSamplePapers = require('./adminSamplePapers');
const adminExamSittings = require('./adminExamSittings');
const settings = require('./settings');
const aiGrade = require('./aiGrade');

const router = Router();

router.use('/auth', auth);
router.use('/lessons', lessons);
router.use('/submissions', submissions);
router.use('/sample-papers', samplePapers);
router.use('/exam-sittings', examSittings);
router.use('/settings', settings);
router.use('/ai-grade', aiGrade);
router.use('/admin/lessons', adminLessons);
router.use('/admin/users', adminUsers);
router.use('/admin/sample-papers', adminSamplePapers);
router.use('/admin/exam-sittings', adminExamSittings);

module.exports = router;
