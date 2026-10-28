const { Router } = require('express');
const lessonController = require('../controllers/lessonController');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');

const router = Router();

router.get('/', optionalAuthenticate, lessonController.list);
router.get('/:slug', optionalAuthenticate, lessonController.getBySlug);

module.exports = router;
