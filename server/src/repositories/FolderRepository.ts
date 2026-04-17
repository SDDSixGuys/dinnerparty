import { Folder, IFolder } from '../models';

export interface FolderFilters {
  userId: string;
  parentId?: string | null;
}

export class FolderRepository {
  async findByFilters(filters: FolderFilters): Promise<IFolder[]> {
    const query: Record<string, any> = { userId: filters.userId };

    if (filters.parentId !== undefined) {
      query.parentId = filters.parentId;
    }

    return Folder.find(query).sort({ sortOrder: 1, name: 1 });
  }

  async findOne(id: string, userId: string): Promise<IFolder | null> {
    return Folder.findOne({ _id: id, userId });
  }

  async findChildren(parentId: string, userId: string): Promise<IFolder[]> {
    return Folder.find({ parentId, userId }).sort({ sortOrder: 1, name: 1 });
  }

  async findDescendants(path: string, userId: string): Promise<IFolder[]> {
    return Folder.find({
      userId,
      path: { $regex: `^${path}` },
    }).sort({ depth: 1, sortOrder: 1 });
  }

  async create(data: Record<string, any>, userId: string): Promise<IFolder> {
    const folder = new Folder({ ...data, userId });
    return folder.save();
  }

  async update(
    id: string,
    userId: string,
    updates: Record<string, any>
  ): Promise<IFolder | null> {
    return Folder.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, userId: string): Promise<IFolder | null> {
    return Folder.findOneAndDelete({ _id: id, userId });
  }

  async deleteMany(filter: Record<string, any>): Promise<number> {
    const result = await Folder.deleteMany(filter);
    return result.deletedCount;
  }

  async updateMany(
    filter: Record<string, any>,
    updates: Record<string, any>
  ): Promise<number> {
    const result = await Folder.updateMany(filter, updates);
    return result.modifiedCount;
  }
}
