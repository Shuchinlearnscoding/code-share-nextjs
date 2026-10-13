'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

// Login/signup are guest-only: a signed-in user who lands here (back button,
// banner CTA, old link) is sent home instead of seeing an empty auth form.
export default function GuestOnly({ redirectTo = '/', children }) {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session.data?.user;

  useEffect(() => {
    if (user) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo, user]);

  if (session.isPending || user) {
    return null;
  }

  return children;
}
