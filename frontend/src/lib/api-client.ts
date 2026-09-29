export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errBody: { error?: { code?: string; message?: string; details?: unknown } } = {};
    try {
      errBody = await res.json();
    } catch {
      errBody = { error: { message: res.statusText, code: 'HTTP_ERROR' } };
    }
    const errorInfo = errBody.error || {};
    throw new ApiError(
      errorInfo.code || 'UNKNOWN_ERROR',
      errorInfo.message || 'An unexpected error occurred',
      res.status,
      errorInfo.details
    );
  }

  return res.json();
}
