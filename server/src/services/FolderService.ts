import { FolderRepository, FolderFilters } from '../repositories/FolderRepository';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { Recipe } from '../models';

export class FolderService {
  constructor(private folderRepository: FolderRepository) {}

  async list(filters: FolderFilters) {
    return this.folderRepository.findByFilters(filters);
  }

  async get(id: string, userId: string) {
    const folder = await this.folderRepository.findOne(id, userId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }
    return folder;
  }

  async getChildren(id: string, userId: string) {
    // Verify the parent folder exists and belongs to user
    const folder = await this.folderRepository.findOne(id, userId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }
    return this.folderRepository.findChildren(id, userId);
  }

  async create(data: Record<string, any>, userId: string) {
    if (!data.name?.trim()) {
      throw new ValidationError('Folder name is required');
    }

    let parentPath = '/';
    let depth = 0;

    if (data.parentId) {
      const parent = await this.folderRepository.findOne(data.parentId, userId);
      if (!parent) {
        throw new NotFoundError('Parent folder not found');
      }
      parentPath = parent.path === '/'
        ? `/${parent._id}`
        : `${parent.path}/${parent._id}`;
      depth = parent.depth + 1;
    }

    const folder = await this.folderRepository.create(
      { ...data, path: parentPath, depth },
      userId
    );

    // Update path to include own ID
    const fullPath = parentPath === '/'
      ? `/${folder._id}`
      : `${parentPath}/${folder._id}`;

    return this.folderRepository.update(String(folder._id), userId, { path: fullPath });
  }

  async update(id: string, userId: string, updates: Record<string, any>) {
    // Don't allow changing parentId through regular update — use move instead
    delete updates.parentId;
    delete updates.path;
    delete updates.depth;

    const folder = await this.folderRepository.update(id, userId, updates);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }
    return folder;
  }

  async move(id: string, userId: string, newParentId: string | null) {
    const folder = await this.folderRepository.findOne(id, userId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    let newParentPath = '/';
    let newDepth = 0;

    if (newParentId) {
      const newParent = await this.folderRepository.findOne(newParentId, userId);
      if (!newParent) {
        throw new NotFoundError('Target folder not found');
      }

      // Prevent moving a folder into its own subtree
      if (newParent.path.startsWith(folder.path)) {
        throw new ValidationError('Cannot move a folder into its own subtree');
      }

      newParentPath = newParent.path;
      newDepth = newParent.depth + 1;
    }

    const oldPath = folder.path;
    const newPath = newParentPath === '/'
      ? `/${folder._id}`
      : `${newParentPath}/${folder._id}`;
    const depthDiff = newDepth - folder.depth;

    // Update all descendants' paths
    const descendants = await this.folderRepository.findDescendants(
      `${oldPath}/`,
      userId
    );

    for (const descendant of descendants) {
      const updatedPath = descendant.path.replace(oldPath, newPath);
      await this.folderRepository.update(
        String(descendant._id),
        userId,
        { path: updatedPath, depth: descendant.depth + depthDiff }
      );
    }

    // Update the folder itself
    return this.folderRepository.update(id, userId, {
      parentId: newParentId,
      path: newPath,
      depth: newDepth,
    });
  }

  async delete(id: string, userId: string) {
    const folder = await this.folderRepository.findOne(id, userId);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    // Delete all descendant folders
    await this.folderRepository.deleteMany({
      userId,
      path: { $regex: `^${folder.path}/` },
    });

    // Remove this folder from any recipes' folderIds arrays
    await Recipe.updateMany(
      { userId, folderIds: id },
      { $pull: { folderIds: id } }
    );

    return this.folderRepository.delete(id, userId);
  }
}
