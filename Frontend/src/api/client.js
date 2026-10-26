// API Client with JWT authorization support

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('geark_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Lỗi máy chủ (${res.status})`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      // In case dev server proxy hasn't started or port 5000 directly
      console.warn(`[API Client] Fetch failed on ${url}, attempting direct fallback to http://localhost:5000${endpoint}`);
      if (!url.startsWith('http://localhost:5000')) {
        const directRes = await fetch(`http://localhost:5000${endpoint}`, {
          ...options,
          headers,
        });
        const directData = await directRes.json().catch(() => ({}));
        if (!directRes.ok) throw new Error(directData.message || 'Lỗi kết nối Backend');
        return directData;
      }
    }
    throw err;
  }
}

export default request;
