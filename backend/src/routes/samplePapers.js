const { Router } = require('express');
const samplePaperController = require('../controllers/samplePaperController');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', optionalAuthenticate, samplePaperController.list);
router.get('/:slug', authenticate, samplePaperController.getBySlug);

module.exports = router;
