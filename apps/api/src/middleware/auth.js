import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
    });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this resource',
        code: 'FORBIDDEN',
      });
    }

    return next();
  };
}

export function requireOwnership(getOwnerId) {
  return (req, res, next) => {
    const resourceOwnerId = getOwnerId(req);

    if (!resourceOwnerId || String(resourceOwnerId) !== String(req.user.sub)) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own records',
        code: 'OWNERSHIP_REQUIRED',
      });
    }

    return next();
  };
}
