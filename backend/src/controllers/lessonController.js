const lessonService = require('../services/lessonService');

async function list(req, res, next) {
  try {
    const lessons = await lessonService.listLessons({ type: req.query.type }, req.user);
    res.json(lessons);
  } catch (err) {
    next(err);
  }
}

async function getBySlug(req, res, next) {
  try {
    const lesson = await lessonService.getLessonBySlug(req.params.slug, req.user);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

async function getForAdmin(req, res, next) {
  try {
    const lesson = await lessonService.getLessonForAdmin(req.params.id);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const lesson = await lessonService.upsertLesson(req.body);
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const lesson = await lessonService.upsertLesson(req.body, req.params.id);
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await lessonService.deleteLesson(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getBySlug, getForAdmin, create, update, remove };
