export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userStr = localStorage.getItem('parcelflow_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  const token = localStorage.getItem('parcelflow_token');

  if (user && user.id) {
    headers['x-user-id'] = user.id;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    let errMsg = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch {}
    throw new Error(errMsg);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(`Endpoint /api${endpoint} returned HTML instead of JSON. The route may not be mapped.`);
  }

  const rawText = await res.text();
  try {
    return rawText ? JSON.parse(rawText) : ({} as T);
  } catch (err: any) {
    throw new Error(`Invalid JSON received from /api${endpoint}: ${err.message}`);
  }
}
