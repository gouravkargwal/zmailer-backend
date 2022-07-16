const Joi = require("joi");

const authLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const authRegisterSchema = Joi.object({
  name: Joi.string().max(32).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(8).required(),
  // cpassword: Joi.string().min(8).required(),
});

const authForgetPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const authResetPasswordSchema = Joi.object({
  resetPasswordLink: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  // cpassword: Joi.string().min(8).required(),
});

module.exports = {
  authLoginSchema,
  authRegisterSchema,
  authForgetPasswordSchema,
  authResetPasswordSchema,
};
