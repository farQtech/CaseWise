import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../middleware/auth';

export const createAuthRoutes = (userModel: UserModel): Router => {
  const router = Router();

  // Login endpoint
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await userModel.verifyPassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Set secure HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      // Return success response (without token in body for security)
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal server error during login'
      });
    }
  });

  // Logout endpoint
  router.post('/logout', (req: Request, res: Response) => {
    try {
      // Clear the token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      res.json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Internal server error during logout'
      });
    }
  });

  // Seed admin user endpoint
  router.post('/seed', async (req: Request, res: Response) => {
    try {
      await userModel.seedAdminUser();
      res.json({
        message: 'Admin user seeded successfully',
        credentials: {
          email: 'admin@casewise.com',
          password: 'admin'
        }
      });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({
        error: 'Internal server error during seeding'
      });
    }
  });

  // Verify token endpoint
  router.get('/verify', async (req: Request, res: Response) => {
    try {
      // Check for token in cookies
      const token = req.cookies?.token;
      
      if (!token) {
        return res.status(401).json({
          error: 'No token provided'
        });
      }

      const user = await userModel.findById(token);

      if (!user) {
        return res.status(401).json({
          error: 'Invalid token'
        });
      }

      res.json({
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        error: 'Internal server error during token verification'
      });
    }
  });

  return router;
};
