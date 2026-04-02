export async function apiJson<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    credentials: "include",
  });

  const text = await res.text();
  if (!text) {
    return {} as T;
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    const preview = text.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`Expected JSON but got: ${preview}`);
  }

  if (!res.ok) {
    const message =
      (data as any)?.error || (data as any)?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}
