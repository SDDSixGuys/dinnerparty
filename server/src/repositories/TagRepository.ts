import { Tag, ITag } from '../models';

export interface TagFilters {
  userId: string;
}

export class TagRepository {
  async findByFilters(filters: TagFilters): Promise<ITag[]> {
    return Tag.find({ userId: filters.userId }).sort({ name: 1 });
  }

  async findOne(id: string, userId: string): Promise<ITag | null> {
    return Tag.findOne({ _id: id, userId });
  }

  async findByName(name: string, userId: string): Promise<ITag | null> {
    return Tag.findOne({ name: name.toLowerCase().trim(), userId });
  }

  async create(data: Record<string, unknown>, userId: string): Promise<ITag> {
    const tag = new Tag({ ...data, userId });
    return tag.save();
  }

  async update(id: string, userId: string, updates: Record<string, unknown>): Promise<ITag | null> {
    return Tag.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );
  }

  async delete(id: string, userId: string): Promise<ITag | null> {
    return Tag.findOneAndDelete({ _id: id, userId });
  }
}
