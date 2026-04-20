const API_BASE = import.meta.env.VITE_API_URL || '';

export class HttpClient {
  async json<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
    const url = typeof input === 'string' && input.startsWith('/') ? `${API_BASE}${input}` : input;
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      credentials: 'include',
    });

    const text = await res.text();
    if (!text) {
      return {} as T;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      const preview = text.slice(0, 200).replace(/\s+/g, ' ');
      throw new Error(`Expected JSON but got: ${preview}`);
    }

    if (!res.ok) {
      const message =
        (data as any)?.error ||
        (data as any)?.message ||
        `Request failed (${res.status})`;
      throw new Error(message);
    }

    return data as T;
  }
}

export const httpClient = new HttpClient();

// Backward-compatible standalone export
export async function apiJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  return httpClient.json<T>(input, init);
}
