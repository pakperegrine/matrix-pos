import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * Simple middleware that verifies JWT using `JWT_SECRET` and attaches `req.user` and `req.businessId`.
 * This is intentionally lightweight: in production use passport-jwt or @nestjs/jwt.
 */
export function JwtTenantMiddleware(req: Request & any, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'] || '';
  const token = Array.isArray(auth) ? auth[0] : (auth.startsWith('Bearer ') ? auth.slice(7) : auth);
  
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'change_this_secret';
      const payload = jwt.verify(token, secret) as any;
      req.user = payload;
      if (payload && payload.business_id) req.businessId = payload.business_id;
    } catch (err) {
      // invalid token — ignore and continue as unauthenticated
    }
  }
  
  // Development convenience: if no token/businessId provided, allow a dev fallback
  // This makes local testing easier — do NOT enable in production.
  if (!req.businessId && process.env.NODE_ENV !== 'production') {
    req.businessId = process.env.DEV_BUSINESS_ID || 'dev-business';
  }
  return next();
}

export const JwtTenantMiddlewareWrapper = (req: Request, res: Response, next: NextFunction) => JwtTenantMiddleware(req, res, next);
