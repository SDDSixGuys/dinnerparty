import { HttpClient, httpClient } from './http';

export interface TagItem {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export class TagApiClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  list() {
    return this.http.json<{ tags: TagItem[] }>('/api/tags');
  }

  get(id: string) {
    return this.http.json<{ tag: TagItem }>(`/api/tags/${id}`);
  }

  create(payload: { name: string; color?: string }) {
    return this.http.json<{ tag: TagItem }>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  update(id: string, data: Partial<Pick<TagItem, 'name' | 'color'>>) {
    return this.http.json<{ tag: TagItem }>(`/api/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(id: string) {
    return this.http.json<{ message: string }>(`/api/tags/${id}`, {
      method: 'DELETE',
    });
  }
}

export const tagApiClient = new TagApiClient(httpClient);

export const listTags = () => tagApiClient.list();
export const getTag = (id: string) => tagApiClient.get(id);
export const createTag = (payload: { name: string; color?: string }) => tagApiClient.create(payload);
export const updateTag = (id: string, data: Partial<Pick<TagItem, 'name' | 'color'>>) => tagApiClient.update(id, data);
export const deleteTag = (id: string) => tagApiClient.delete(id);
