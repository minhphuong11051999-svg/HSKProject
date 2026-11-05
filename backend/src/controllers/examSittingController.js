const examSittingService = require('../services/examSittingService');

async function list(req, res, next) {
  try {
    const years = await examSittingService.listExamYears(req.user);
    res.json(years);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const sitting = await examSittingService.getExamSittingBySlug(req.params.slug, req.user);
    res.json(sitting);
  } catch (err) {
    next(err);
  }
}

async function listYearsForAdmin(req, res, next) {
  try {
    const years = await examSittingService.listExamYearsForAdmin();
    res.json(years);
  } catch (err) {
    next(err);
  }
}

async function createYear(req, res, next) {
  try {
    const year = await examSittingService.upsertExamYear(req.body);
    res.status(201).json(year);
  } catch (err) {
    next(err);
  }
}

async function updateYear(req, res, next) {
  try {
    const year = await examSittingService.upsertExamYear(req.body, req.params.id);
    res.json(year);
  } catch (err) {
    next(err);
  }
}

async function removeYear(req, res, next) {
  try {
    await examSittingService.deleteExamYear(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getForAdmin(req, res, next) {
  try {
    const sitting = await examSittingService.getExamSittingForAdmin(req.params.id);
    res.json(sitting);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const sitting = await examSittingService.upsertExamSitting(req.body);
    res.status(201).json(sitting);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const sitting = await examSittingService.upsertExamSitting(req.body, req.params.id);
    res.json(sitting);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await examSittingService.deleteExamSitting(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getBySlug,
  listYearsForAdmin,
  createYear,
  updateYear,
  removeYear,
  getForAdmin,
  create,
  update,
  remove,
};
