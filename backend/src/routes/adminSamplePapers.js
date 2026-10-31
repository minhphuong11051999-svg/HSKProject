const { Router } = require('express');
const samplePaperController = require('../controllers/samplePaperController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/:id', samplePaperController.getForAdmin);
router.post('/', samplePaperController.create);
router.put('/:id', samplePaperController.update);
router.delete('/:id', samplePaperController.remove);

module.exports = router;
