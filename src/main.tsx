import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getAuthHeaders } from './lib/firebase';

// Interceptor global para assegurar cabeçalhos de autenticação em todas as chamadas de IA/SEO
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
  if (url && url.includes('/api/seo-definitions')) {
    try {
      const authHeaders = await getAuthHeaders();
      const headers = new Headers(init?.headers);
      for (const [key, value] of Object.entries(authHeaders)) {
        if (!headers.has(key)) {
          headers.set(key, value);
        }
      }
      return originalFetch(input, {
        ...init,
        headers,
      });
    } catch {
      return originalFetch(input, init);
    }
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
