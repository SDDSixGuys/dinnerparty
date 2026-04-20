import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { env } from '../config/env';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username, password } = req.body;
      const { user, token } = await this.authService.register(email, username, password);

      this.setAuthCookie(res, token);

      res.status(201).json({
        user: { uuid: user.uuid, email: user.email, username: user.username },
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);

      this.setAuthCookie(res, token);

      res.json({
        user: { uuid: user.uuid, email: user.email, username: user.username },
      });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getMe(req.user!.userId);

      res.json({
        user: { uuid: user.uuid, email: user.email, username: user.username },
      });
    } catch (err) {
      next(err);
    }
  };

  logout = (_req: Request, res: Response): void => {
    const isProduction = env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out' });
  };

  private setAuthCookie(res: Response, token: string): void {
    const isProduction = env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
