const yup = require('yup');

const createUserSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  name: yup.string().min(2).required(),
  role: yup.string().oneOf(['USER', 'ADMIN']).default('USER'),
});

module.exports = { createUserSchema };
