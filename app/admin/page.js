import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div>
      <h1>管理員後台</h1>
      <p>請先完成管理員角色與審核流程後再開放操作。</p>
    </div>
  )
}
