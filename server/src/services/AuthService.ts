import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { env } from '../config/env';
import {
  ValidationError,
  AuthError,
  ConflictError,
  NotFoundError,
} from '../errors/AppError';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(email: string, username: string, password: string) {
    if (!email || !username || !password) {
      throw new ValidationError('Email, username, and password are required');
    }
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existing = await this.userRepository.findByEmailOrUsername(email, username);
    if (existing) {
      throw new ConflictError('Email or username already taken');
    }

    const user = this.userRepository.create({ email, username, passwordHash: password });
    await this.userRepository.save(user);

    const rootFolder = this.userRepository.createRootFolder(user._id as any);
    await rootFolder.save();

    user.rootFolderId = rootFolder._id as any;
    await this.userRepository.save(user);

    const token = this.generateToken(String(user._id), user.uuid);
    return { user, token };
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthError('Invalid email or password');
    }

    const token = this.generateToken(String(user._id), user.uuid);
    return { user, token };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  generateToken(userId: string, uuid: string): string {
    return jwt.sign({ userId, uuid }, env.JWT_SECRET, { expiresIn: '7d' });
  }
}
