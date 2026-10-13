'use client';

import { AuthView } from '@neondatabase/auth-ui';
import GuestOnly from '../GuestOnly';

export default function LoginPage() {
  return (
    <GuestOnly>
      <section style={{ maxWidth: 460, margin: '40px auto' }}>
        <AuthView
          view="SIGN_IN"
          redirectTo="/"
          classNames={{
            form: {
              providerButton: 'site-oauth-button',
              outlineButton: 'site-oauth-button',
            },
          }}
        />
      </section>
    </GuestOnly>
  );
}
