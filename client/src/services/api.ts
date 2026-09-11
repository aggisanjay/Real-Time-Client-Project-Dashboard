const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  // Include credentials for HttpOnly refresh cookie
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If 401 Unauthorized, attempt refresh token rotation
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Wait for the ongoing refresh
        try {
          const newToken = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          headers.set('Authorization', `Bearer ${newToken}`);
          return await apiFetch<T>(endpoint, { ...options, headers });
        } catch (err) {
          throw err;
        }
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token expired');
        }

        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.accessToken;
        setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Dispatch token refreshed event for listeners
        window.dispatchEvent(new CustomEvent('token:refreshed', { detail: refreshData.user }));

        // Retry original request with new access token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers, credentials: 'include' });
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:required'));
        throw refreshErr;
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const err: any = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code;
      throw err;
    }

    return data as T;
  } catch (error) {
    throw error;
  }
}
