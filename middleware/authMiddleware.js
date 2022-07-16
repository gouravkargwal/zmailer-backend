const createHttpError = require("http-errors");
const Joi = require("joi");
const authSchema = require("../helpers/validation_schema");

exports.registerMiddleware = async (req, res, next) => {
  try {
    const validated = await authSchema.authRegisterSchema.validateAsync(
      req.body
    );
    console.log(validated);
    req.body = validated;
    next();
  } catch (err) {
    console.log(err);
    if (err.isJoi) return next(createHttpError(422, { message: err }));
    next(createHttpError(500));
  }
};

exports.loginMiddleware = async (req, res, next) => {
  try {
    const validated = await authSchema.authLoginSchema.validateAsync(req.body);
    req.body = validated;
    next();
  } catch (err) {
    console.log(err);
    if (err.isJoi) return next(createHttpError(422, { message: err }));
    next(createHttpError(500));
  }
};

exports.forgetPasswordMiddleware = async (req, res, next) => {
  try {
    const validated = await authSchema.authForgetPasswordSchema.validateAsync(
      req.body
    );
    req.body = validated;
    next();
  } catch (err) {
    console.log(err);
    if (err.isJoi) return next(createHttpError(422, { message: err }));
    next(createHttpError(500));
  }
};

exports.resetPasswordMiddleware = async (req, res, next) => {
  try {
    console.log(req.body);
    const validated = await authSchema.authResetPasswordSchema.validateAsync(
      req.body
    );
    req.body = validated;
    next();
  } catch (err) {
    console.log(err);
    if (err.isJoi) return next(createHttpError(422, { message: err }));
    next(createHttpError(500));
  }
};
