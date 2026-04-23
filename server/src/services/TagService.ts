import { TagRepository } from '../repositories/TagRepository';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { Recipe } from '../models';

export class TagService {
  constructor(private tagRepository: TagRepository) {}

  async list(userId: string) {
    return this.tagRepository.findByFilters({ userId });
  }

  async get(id: string, userId: string) {
    const tag = await this.tagRepository.findOne(id, userId);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    return tag;
  }

  async create(data: Record<string, unknown>, userId: string) {
    const name = (data.name as string)?.trim();
    if (!name) {
      throw new ValidationError('Tag name is required');
    }

    // Check for duplicate
    const existing = await this.tagRepository.findByName(name, userId);
    if (existing) {
      throw new ValidationError('A tag with that name already exists');
    }

    return this.tagRepository.create(data, userId);
  }

  async update(id: string, userId: string, updates: Record<string, unknown>) {
    const tag = await this.tagRepository.update(id, userId, updates);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }
    return tag;
  }

  async delete(id: string, userId: string) {
    const tag = await this.tagRepository.findOne(id, userId);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    // Remove this tag from any recipes
    await Recipe.updateMany(
      { userId, tags: id },
      { $pull: { tags: id } }
    );

    return this.tagRepository.delete(id, userId);
  }
}
