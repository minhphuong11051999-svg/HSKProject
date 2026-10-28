const { Router } = require('express');
const lessonController = require('../controllers/lessonController');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', optionalAuthenticate, lessonController.list);
router.get('/:slug', authenticate, lessonController.getBySlug);

module.exports = router;
