'use client';

import { AuthView } from '@neondatabase/auth-ui';

export default function SignupPage() {
  return (
    <section style={{ maxWidth: 460, margin: '40px auto' }}>
      <AuthView view="SIGN_UP" redirectTo="/" />
    </section>
  );
}
