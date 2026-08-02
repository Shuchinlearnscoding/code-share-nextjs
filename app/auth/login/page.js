'use client';

import { AuthView } from '@neondatabase/auth-ui';

export default function LoginPage() {
  return (
    <section style={{ maxWidth: 460, margin: '40px auto' }}>
      <AuthView view="SIGN_IN" redirectTo="/" />
    </section>
  );
}
