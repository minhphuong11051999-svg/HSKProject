const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { gradeWriting } = require('../services/aiGradeService');

const router = Router();

// PRO learners send their draft; the server adds the paper's hidden grading criteria.
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { samplePaperId, examSittingId, text } = req.body || {};
    res.json(await gradeWriting({ user: req.user, samplePaperId, examSittingId, text }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
