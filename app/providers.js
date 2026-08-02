'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getNeonAuthLocalization } from '@/lib/neonAuthLocalization';

export default function Providers({ children }) {
  const router = useRouter();
  const { lang } = useLanguage();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      redirectTo="/"
      social={{ providers: ['google'] }}
      localization={getNeonAuthLocalization(lang)}
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
