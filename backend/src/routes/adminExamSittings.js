const { Router } = require('express');
const examSittingController = require('../controllers/examSittingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/years', examSittingController.listYearsForAdmin);
router.post('/years', examSittingController.createYear);
router.put('/years/:id', examSittingController.updateYear);
router.delete('/years/:id', examSittingController.removeYear);

router.get('/:id', examSittingController.getForAdmin);
router.post('/', examSittingController.create);
router.put('/:id', examSittingController.update);
router.delete('/:id', examSittingController.remove);

module.exports = router;
