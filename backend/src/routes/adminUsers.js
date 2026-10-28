const { Router } = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createUserSchema } = require('../schemas/userSchemas');

const router = Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', userController.list);
router.post('/', validate(createUserSchema), userController.create);
router.delete('/:id', userController.remove);

module.exports = router;
