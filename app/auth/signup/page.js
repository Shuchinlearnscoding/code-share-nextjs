import { redirect } from 'next/navigation';
import { isStackAuthConfigured } from '@/lib/stack';

export default function SignupPage() {
  if (!isStackAuthConfigured()) {
    redirect('/auth-unavailable');
  }

  redirect('/handler/sign-up');
}
