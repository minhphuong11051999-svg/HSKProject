const { Router } = require('express');
const lessonController = require('../controllers/lessonController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

router.use(authenticate, authorize('ADMIN'));
router.post('/', lessonController.create);
router.put('/:id', lessonController.update);
router.delete('/:id', lessonController.remove);

module.exports = router;
