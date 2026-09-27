export function getAuthToken() {
  return localStorage.getItem('spotify_auth_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('spotify_auth_token', token);
  } else {
    localStorage.removeItem('spotify_auth_token');
  }
}

// Global fetch interceptor to automatically attach x-auth-token on all /api requests
const originalFetch = window.fetch;

window.fetch = async function (resource, config = {}) {
  let url = typeof resource === 'string' ? resource : resource?.url || '';

  if (url.startsWith('/api') && !url.startsWith('/api/auth/')) {
    const token = getAuthToken();
    if (token) {
      config = config || {};
      const headers = new Headers(config.headers || {});
      if (!headers.has('x-auth-token')) {
        headers.set('x-auth-token', token);
      }
      config.headers = headers;
    }
  }

  const response = await originalFetch(resource, config);

  // If 401 Unauthorized, notify app to show login modal
  if (response.status === 401 && url.startsWith('/api') && !url.startsWith('/api/auth/login')) {
    window.dispatchEvent(new CustomEvent('spotify:unauthorized'));
  }

  return response;
};

export const authFetch = window.fetch;
