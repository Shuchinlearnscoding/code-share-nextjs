import { createNeonAuth } from '@neondatabase/auth/next/server';

let instance;

// Created lazily so `next build` can collect page data without the runtime
// env vars being present (they only exist at request time on Vercel).
export function getAuth() {
  if (!instance) {
    instance = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET,
      },
      logLevel: 'warn',
    });
  }
  return instance;
}

export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getAuth()[prop];
      return typeof value === 'function' ? value.bind(getAuth()) : value;
    },
  }
);
