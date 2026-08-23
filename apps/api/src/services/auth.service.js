import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Currency from '../models/Currency.js';
import Language from '../models/Language.js';
import Location from '../models/Location.js';
import UserPreference from '../models/UserPreference.js';
import { env } from '../config/env.js';
import { ROLES } from '../constants/roles.js';
import { getDefaultCurrencyCode } from './currency.service.js';

export const dashboardRoutes = {
  [ROLES.CUSTOMER]: '/dashboard',
  [ROLES.AGENT]: '/agent/dashboard',
  [ROLES.SELLER]: '/seller/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
};

export async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
}

export function createEmailVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function resolvePreferenceReferences({ language, currency, country } = {}) {
  const languageCode = String(language || '').trim().toLowerCase() || 'en';
  const currencyCode = String(currency || '').trim().toUpperCase() || getDefaultCurrencyCode();
  const countryCode = String(country || '').trim().toUpperCase();

  const [languageDoc, currencyDoc, countryDoc] = await Promise.all([
    Language.findOne({ code: languageCode }).lean(),
    Currency.findOne({ code: currencyCode }).lean(),
    countryCode ? Location.findOne({ countryCode }).lean() : null,
  ]);

  return {
    languageId: languageDoc?._id ?? null,
    currencyId: currencyDoc?._id ?? null,
    countryId: countryDoc?._id ?? null,
  };
}

async function syncUserPreferences(userId, { language, currency, country } = {}) {
  const preferences = await resolvePreferenceReferences({ language, currency, country });
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  user.preferredLanguage = preferences.languageId || user.preferredLanguage || null;
  user.preferredCurrency = preferences.currencyId || user.preferredCurrency || null;
  user.country = preferences.countryId || user.country || null;
  await user.save();

  await UserPreference.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        user: user._id,
        language: preferences.languageId || user.preferredLanguage || null,
        currency: preferences.currencyId || user.preferredCurrency || null,
        country: preferences.countryId || user.country || null,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    language: preferences.languageId || user.preferredLanguage || null,
    currency: preferences.currencyId || user.preferredCurrency || null,
    country: preferences.countryId || user.country || null,
  };
}

export async function registerUser({ fullName, email, password, phone = '', role = ROLES.CUSTOMER, country = '', preferredLanguage = 'en', preferredCurrency = getDefaultCurrencyCode() }) {
  if (!fullName || !email || !password) {
    throw Object.assign(new Error('Full name, email and password are required'), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw Object.assign(new Error('A user with this email already exists'), { statusCode: 409, code: 'USER_EXISTS' });
  }

  const allowedRoles = [ROLES.CUSTOMER, ROLES.AGENT, ROLES.SELLER];
  if (!allowedRoles.includes(role)) {
    throw Object.assign(new Error('Unsupported role for public registration'), { statusCode: 400, code: 'INVALID_ROLE' });
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = createEmailVerificationToken();
  const hashedVerificationToken = await hashPassword(verificationToken);

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    phone,
    passwordHash,
    role,
    status: role === ROLES.AGENT ? 'PENDING_APPROVAL' : 'ACTIVE',
    emailVerified: false,
    emailVerificationToken: hashedVerificationToken,
    emailVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = await hashPassword(refreshToken);
  await user.save();

  const preferenceRefs = await syncUserPreferences(user._id, {
    language: preferredLanguage,
    currency: preferredCurrency,
    country,
  });
  const languageCode = preferenceRefs?.language ? (await Language.findById(preferenceRefs.language).lean())?.code || 'en' : 'en';
  const currencyCode = preferenceRefs?.currency ? (await Currency.findById(preferenceRefs.currency).lean())?.code || getDefaultCurrencyCode() : getDefaultCurrencyCode();

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      preferredLanguage: languageCode,
      preferredCurrency: currencyCode,
      country: country || 'IN',
    },
    tokens: {
      accessToken,
      refreshToken,
    },
    redirectPath: dashboardRoutes[user.role] ?? '/dashboard',
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error('Email and password are required'), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +refreshTokenHash');

  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401, code: 'INVALID_CREDENTIALS' });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokenHash = await hashPassword(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  const preferenceRefs = await syncUserPreferences(user._id, {
    language: user.preferredLanguage ? (await Language.findById(user.preferredLanguage).lean())?.code : 'en',
    currency: user.preferredCurrency ? (await Currency.findById(user.preferredCurrency).lean())?.code : getDefaultCurrencyCode(),
    country: user.country ? (await Location.findById(user.country).lean())?.countryCode : '',
  });
  const languageCode = preferenceRefs?.language ? (await Language.findById(preferenceRefs.language).lean())?.code || 'en' : 'en';
  const currencyCode = preferenceRefs?.currency ? (await Currency.findById(preferenceRefs.currency).lean())?.code || getDefaultCurrencyCode() : getDefaultCurrencyCode();

  return {
    user: {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      preferredLanguage: languageCode,
      preferredCurrency: currencyCode,
      country: preferenceRefs?.country ? (await Location.findById(preferenceRefs.country).lean())?.countryCode || 'IN' : 'IN',
    },
    tokens: {
      accessToken,
      refreshToken,
    },
    redirectPath: dashboardRoutes[user.role] ?? '/dashboard',
  };
}

export async function getUserPreferences(userId) {
  const user = await User.findById(userId)
    .populate('preferredLanguage preferredCurrency country')
    .lean();

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
  }

  const languageCode = user.preferredLanguage?.code || 'en';
  const currencyCode = user.preferredCurrency?.code || getDefaultCurrencyCode();
  const countryCode = user.country?.countryCode || 'IN';

  return {
    language: languageCode,
    currency: currencyCode,
    country: countryCode,
  };
}

export async function updateUserPreferences(userId, { language, currency, country } = {}) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });
  }

  const nextPreferences = await syncUserPreferences(userId, { language, currency, country });
  if (!nextPreferences) {
    throw Object.assign(new Error('Unable to save user preferences'), { statusCode: 500, code: 'PREFERENCES_SAVE_FAILED' });
  }

  return await getUserPreferences(userId);
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw Object.assign(new Error('Refresh token is required'), { statusCode: 401, code: 'REFRESH_TOKEN_REQUIRED' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    throw Object.assign(new Error('Session not found'), { statusCode: 401, code: 'SESSION_NOT_FOUND' });
  }

  const isValidRefreshToken = await verifyPassword(refreshToken, user.refreshTokenHash);
  if (!isValidRefreshToken) {
    throw Object.assign(new Error('Refresh token rejected'), { statusCode: 401, code: 'INVALID_REFRESH_TOKEN' });
  }

  const nextAccessToken = createAccessToken(user);
  const nextRefreshToken = createRefreshToken(user);
  user.refreshTokenHash = await hashPassword(nextRefreshToken);
  await user.save();

  return {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  };
}

export async function logoutUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  user.refreshTokenHash = '';
  await user.save();
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw Object.assign(new Error('Email is required'), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return { message: 'If an account exists, a reset email will be sent.' };
  }

  const resetToken = createEmailVerificationToken();
  user.resetTokenHash = await hashPassword(resetToken);
  user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  return {
    message: 'Password reset instructions have been sent.',
    resetToken,
  };
}

export async function resetPassword({ token, newPassword }) {
  if (!token || !newPassword) {
    throw Object.assign(new Error('Token and new password are required'), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  const users = await User.find({ resetTokenExpiresAt: { $gt: Date.now() } }).select('+resetTokenHash');
  const matchingUser = await Promise.all(
    users.map(async (user) => {
      const isMatch = await verifyPassword(token, user.resetTokenHash || '');
      return isMatch ? user : null;
    })
  ).then((results) => results.find(Boolean));

  if (!matchingUser) {
    throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400, code: 'INVALID_RESET_TOKEN' });
  }

  matchingUser.passwordHash = await hashPassword(newPassword);
  matchingUser.resetTokenHash = '';
  matchingUser.resetTokenExpiresAt = null;
  await matchingUser.save();

  return { message: 'Password reset successful' };
}

export async function verifyEmailToken(token) {
  if (!token) {
    throw Object.assign(new Error('Verification token is required'), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }

  const user = await User.findOne({
    emailVerificationExpiresAt: { $gt: Date.now() },
  }).select('+emailVerificationToken');

  if (!user || !user.emailVerificationToken) {
    throw Object.assign(new Error('Invalid or expired verification token'), { statusCode: 400, code: 'INVALID_VERIFICATION_TOKEN' });
  }

  const isMatch = await verifyPassword(token, user.emailVerificationToken || '');
  if (!isMatch) {
    throw Object.assign(new Error('Invalid or expired verification token'), { statusCode: 400, code: 'INVALID_VERIFICATION_TOKEN' });
  }

  user.emailVerified = true;
  user.emailVerificationToken = '';
  user.emailVerificationExpiresAt = null;
  await user.save();

  return { message: 'Email verified successfully' };
}
