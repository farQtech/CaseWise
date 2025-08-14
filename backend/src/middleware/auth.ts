import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AUTH } from './constants';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}


export const generateToken = (user: { id: string; email: string; role: string }): string => {
    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
  const options: SignOptions = { expiresIn: AUTH.TOKEN_EXPIRY as SignOptions['expiresIn'] }; // cast to string
  
  return jwt.sign(payload, AUTH.JWT_SECRET, options);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, AUTH.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const authMiddleware = (userModel: UserModel) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Worker API key check
      const apiKey = req.headers[AUTH.HEADER_API_KEY];
      if (apiKey === process.env.WORKER_API_KEY) return next();

      // Token from header or cookie
      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.substring(7);
      else if (req.cookies?.token) token = req.cookies.token;

      if (!token) return res.status(401).json({ error: AUTH.ERROR_NO_TOKEN });

      const decoded = verifyToken(token);
      if (!decoded) return res.status(401).json({ error: AUTH.ERROR_INVALID_TOKEN });

      const user = await userModel.findById(decoded.id);
      if (!user) return res.status(401).json({ error: AUTH.ERROR_USER_NOT_FOUND });

      req.user = { id: user.id, email: user.email, role: user.role };
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: AUTH.ERROR_INTERNAL });
    }
  };
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: AUTH.ERROR_AUTH_REQUIRED });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: AUTH.ERROR_INSUFFICIENT_PERMISSIONS });
    next();
  };
};
