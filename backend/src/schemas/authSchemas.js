const yup = require('yup');

const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
  name: yup.string().min(2).required(),
});

const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const refreshSchema = yup.object({
  refreshToken: yup.string().required(),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
