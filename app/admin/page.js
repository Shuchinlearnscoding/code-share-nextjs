import { stackServerApp } from '@/lib/stack';

export default async function AdminPage() {
  await stackServerApp.getUser({ or: 'redirect' });

  return (
    <div>
      <h1>管理員後台</h1>
      <p>請先完成管理員角色與審核流程後再開放操作。</p>
    </div>
  )
}
