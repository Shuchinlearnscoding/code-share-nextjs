'use client';

import { AuthView } from '@neondatabase/auth-ui';

export default function SignOutPage() {
  return <AuthView view="SIGN_OUT" redirectTo="/" />;
}
