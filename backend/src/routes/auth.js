const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerSchema, loginSchema, refreshSchema } = require('../schemas/authSchemas');

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshSchema), authController.refresh);
router.get('/me', authenticate, authController.me);

module.exports = router;
