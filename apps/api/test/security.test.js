import test from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema } from '../src/validators/auth.validator.js';
import { convertCurrency, getDefaultCurrencyCode, resolveCurrencyCodeFromCountry } from '../src/services/currency.service.js';
import { authenticate, authorize, requireOwnership } from '../src/middleware/auth.js';

test('public registration rejects admin role creation', () => {
  const result = registerSchema.validate({
    fullName: 'Platform Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN',
  });

  assert.equal(Boolean(result.error), true);
  assert.match(result.error.message, /role/i);
});

test('default currency resolves to INR for India', () => {
  assert.equal(resolveCurrencyCodeFromCountry('IN'), 'INR');
  assert.equal(getDefaultCurrencyCode(), 'INR');
});

test('exchange-rate conversion remains stable and predictable for supported currencies', () => {
  assert.ok(Math.abs(convertCurrency(1000, 'INR', 'USD') - 12) < 0.01);
  assert.ok(Math.abs(convertCurrency(1000, 'INR', 'AED') - 45) < 0.01);
  assert.ok(Math.abs(convertCurrency(1000, 'USD', 'INR') - 83333.3333) < 0.5);
});

test('authenticate rejects missing bearer token', () => {
  let statusCode = 0;
  let payload = null;
  const req = { headers: {} };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  authenticate(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(statusCode, 401);
  assert.equal(payload.code, 'AUTH_REQUIRED');
});

test('authorize blocks unauthorized roles', () => {
  let statusCode = 0;
  let payload = null;
  const req = { user: { role: 'CUSTOMER' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  authorize('ADMIN', 'SUPER_ADMIN')(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(statusCode, 403);
  assert.equal(payload.code, 'FORBIDDEN');
});

test('requireOwnership prevents cross-user access to private records', () => {
  let statusCode = 0;
  let payload = null;
  const req = { user: { sub: 'user-2' } };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      return this;
    },
  };

  requireOwnership(() => 'user-1')(req, res, () => {
    throw new Error('next should not be called');
  });

  assert.equal(statusCode, 403);
  assert.equal(payload.code, 'OWNERSHIP_REQUIRED');
});
