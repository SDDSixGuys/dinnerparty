import { User, IUser, Folder } from '../models';
import mongoose from 'mongoose';

export class UserRepository {
  async findByEmailOrUsername(email: string, username: string): Promise<IUser | null> {
    return User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select('-passwordHash');
  }

  create(data: { email: string; username: string; passwordHash: string }): IUser {
    return new User(data);
  }

  async save(user: IUser): Promise<IUser> {
    return user.save();
  }

  createRootFolder(userId: mongoose.Types.ObjectId): InstanceType<typeof Folder> {
    return new Folder({
      userId,
      name: 'My Recipes',
      parentId: null,
      path: '/',
      depth: 0,
    });
  }
}
