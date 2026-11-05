const { Router } = require('express');
const examSittingController = require('../controllers/examSittingController');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.get('/', optionalAuthenticate, examSittingController.list);
router.get('/:slug', authenticate, examSittingController.getBySlug);

module.exports = router;
