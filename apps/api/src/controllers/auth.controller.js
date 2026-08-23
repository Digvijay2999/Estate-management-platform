import { successResponse, errorResponse } from '../utils/response.js';
import {
  registerUser as registerUserService,
  loginUser as loginUserService,
  refreshAccessToken,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  verifyEmailToken,
  getUserPreferences,
  updateUserPreferences,
} from '../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  passwordResetRequestSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';

export async function registerUser(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await registerUserService(value);
    return successResponse(res, 201, result, 'Registration successful');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to complete registration', error.code ?? 'REGISTRATION_FAILED');
  }
}

export async function loginUser(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await loginUserService(value);
    return successResponse(res, 200, result, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to login', error.code ?? 'LOGIN_FAILED');
  }
}

export async function refreshToken(req, res) {
  try {
    const payload = req.body?.refreshToken ? { refreshToken: req.body.refreshToken } : { refreshToken: req.headers['x-refresh-token'] };
    const { error, value } = refreshTokenSchema.validate(payload);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await refreshAccessToken(value.refreshToken);
    return successResponse(res, 200, result, 'Token refreshed successfully');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to refresh token', error.code ?? 'TOKEN_REFRESH_FAILED');
  }
}

export async function logout(req, res) {
  try {
    await logoutUser(req.user?.sub ?? req.body?.userId);
    return successResponse(res, 200, {}, 'Logout successful');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to logout', error.code ?? 'LOGOUT_FAILED');
  }
}

export async function forgotPassword(req, res) {
  try {
    const { error, value } = passwordResetRequestSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await requestPasswordReset(value.email);
    return successResponse(res, 200, result, 'Password reset request accepted');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to process password reset request', error.code ?? 'PASSWORD_RESET_FAILED');
  }
}

export async function resetPasswordToken(req, res) {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await resetPassword(value);
    return successResponse(res, 200, result, 'Password reset successful');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to reset password', error.code ?? 'PASSWORD_RESET_FAILED');
  }
}

export async function verifyEmail(req, res) {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, error.details[0].message, 'VALIDATION_ERROR');
    }

    const result = await verifyEmailToken(value.token);
    return successResponse(res, 200, result, 'Email verified successfully');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to verify email', error.code ?? 'EMAIL_VERIFICATION_FAILED');
  }
}

export async function me(req, res) {
  try {
    const user = await getUserPreferences(req.user.sub);
    return successResponse(
      res,
      200,
      {
        user: {
          id: req.user.sub,
          email: req.user.email,
          role: req.user.role,
          country: user.country,
          preferredLanguage: user.language,
          preferredCurrency: user.currency,
        },
      },
      'Authenticated user profile retrieved'
    );
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to fetch profile', error.code ?? 'PROFILE_FETCH_FAILED');
  }
}

export async function getUserPreferencesController(req, res) {
  try {
    const preferences = await getUserPreferences(req.user.sub);
    return successResponse(res, 200, { preferences }, 'User preferences fetched successfully');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to fetch user preferences', error.code ?? 'PREFERENCES_FETCH_FAILED');
  }
}

export async function updateUserPreferencesController(req, res) {
  try {
    const preferences = await updateUserPreferences(req.user.sub, req.body);
    return successResponse(res, 200, { preferences }, 'User preferences updated successfully');
  } catch (error) {
    return errorResponse(res, error.statusCode ?? 500, error.message ?? 'Unable to update user preferences', error.code ?? 'PREFERENCES_UPDATE_FAILED');
  }
}
