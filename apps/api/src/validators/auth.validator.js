import Joi from 'joi';

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  phone: Joi.string().allow('').trim(),
  country: Joi.string().allow('').trim(),
  preferredLanguage: Joi.string().allow('').trim(),
  preferredCurrency: Joi.string().allow('').trim(),
  role: Joi.string().valid('CUSTOMER', 'AGENT', 'SELLER').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});
