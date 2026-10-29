const { Router } = require('express');
const submissionController = require('../controllers/submissionController');
const authenticate = require('../middleware/authenticate');

const router = Router();

router.use(authenticate);
router.post('/', submissionController.create);
router.get('/me', submissionController.listMine);
router.get('/me/stats', submissionController.myStats);
router.get('/me/:lessonSlug', submissionController.listMine);

module.exports = router;
