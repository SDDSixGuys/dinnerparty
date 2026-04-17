import { HttpClient, httpClient } from './http';

export interface FolderItem {
  _id: string;
  name: string;
  parentId: string | null;
  path: string;
  depth: number;
  sortOrder: number;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export class FolderApiClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  list(params?: { parentId?: string }) {
    const qs = new URLSearchParams();
    if (params?.parentId) qs.set('parentId', params.parentId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return this.http.json<{ folders: FolderItem[] }>(`/api/folders${suffix}`);
  }

  get(id: string) {
    return this.http.json<{ folder: FolderItem }>(`/api/folders/${id}`);
  }

  getChildren(id: string) {
    return this.http.json<{ folders: FolderItem[] }>(`/api/folders/${id}/children`);
  }

  create(payload: { name: string; parentId?: string; color?: string; icon?: string }) {
    return this.http.json<{ folder: FolderItem }>('/api/folders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  update(id: string, data: Partial<Pick<FolderItem, 'name' | 'color' | 'icon' | 'sortOrder'>>) {
    return this.http.json<{ folder: FolderItem }>(`/api/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  move(id: string, newParentId: string | null) {
    return this.http.json<{ folder: FolderItem }>(`/api/folders/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    });
  }

  delete(id: string) {
    return this.http.json<{ message: string }>(`/api/folders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const folderApiClient = new FolderApiClient(httpClient);

export const listFolders = (params?: { parentId?: string }) => folderApiClient.list(params);
export const getFolder = (id: string) => folderApiClient.get(id);
export const getFolderChildren = (id: string) => folderApiClient.getChildren(id);
export const createFolder = (payload: { name: string; parentId?: string; color?: string; icon?: string }) => folderApiClient.create(payload);
export const updateFolder = (id: string, data: Partial<Pick<FolderItem, 'name' | 'color' | 'icon' | 'sortOrder'>>) => folderApiClient.update(id, data);
export const moveFolder = (id: string, newParentId: string | null) => folderApiClient.move(id, newParentId);
export const deleteFolder = (id: string) => folderApiClient.delete(id);
