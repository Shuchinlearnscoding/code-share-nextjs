'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth-client';
import { neonAuthLocalizationZhTW } from '@/lib/neonAuthLocalization';

export default function Providers({ children }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      redirectTo="/"
      localization={neonAuthLocalizationZhTW}
      viewPaths={{
        SIGN_IN: 'login',
        SIGN_UP: 'signup',
      }}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
