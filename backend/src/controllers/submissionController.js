const submissionService = require('../services/submissionService');

async function create(req, res, next) {
  try {
    const { lessonId, samplePaperId, examSittingId } = req.body;
    const targetCount = [lessonId, samplePaperId, examSittingId].filter(Boolean).length;
    if (targetCount !== 1) {
      const error = new Error('Exactly one of lessonId, samplePaperId, examSittingId is required');
      error.status = 400;
      throw error;
    }

    const submission = await submissionService.createSubmission({
      userId: req.user.id,
      lessonId,
      samplePaperId,
      examSittingId,
      exerciseType: req.body.exerciseType,
      exerciseId: req.body.exerciseId,
      answerPayload: req.body.answerPayload,
    });
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const submissions = await submissionService.listMySubmissions(req.user.id, {
      lessonSlug: req.params.lessonSlug,
      samplePaperId: req.query.samplePaperId,
      examSittingId: req.query.examSittingId,
    });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

async function myStats(req, res, next) {
  try {
    const stats = await submissionService.getUserStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, myStats };
