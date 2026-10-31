const samplePaperService = require('../services/samplePaperService');

async function list(req, res, next) {
  try {
    const papers = await samplePaperService.listSamplePapers(req.user);
    res.json(papers);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const paper = await samplePaperService.getSamplePaperBySlug(req.params.slug, req.user);
    res.json(paper);
  } catch (err) {
    next(err);
  }
}

async function getForAdmin(req, res, next) {
  try {
    const paper = await samplePaperService.getSamplePaperForAdmin(req.params.id);
    res.json(paper);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const paper = await samplePaperService.upsertSamplePaper(req.body);
    res.status(201).json(paper);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const paper = await samplePaperService.upsertSamplePaper(req.body, req.params.id);
    res.json(paper);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await samplePaperService.deleteSamplePaper(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug, getForAdmin, create, update, remove };
