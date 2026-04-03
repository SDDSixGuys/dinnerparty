import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] ?? 'field';
    res.status(409).json({ error: `That ${field} is already taken` });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
