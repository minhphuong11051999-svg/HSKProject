const submissionService = require('../services/submissionService');

async function create(req, res, next) {
  try {
    const submission = await submissionService.createSubmission({
      userId: req.user.id,
      lessonId: req.body.lessonId,
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
    const submissions = await submissionService.listMySubmissions(req.user.id, req.params.lessonSlug);
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
