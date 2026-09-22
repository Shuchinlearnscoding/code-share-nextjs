import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser } from '@/lib/adminAuth';
import './admin.css';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/auth/login');
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">管理員後台</h1>
      <p className="admin-subtitle">已登入：{admin.email}</p>

      <ul className="admin-nav-list">
        <li>
          <Link href="/admin/banner" className="admin-nav-card">
            <span className="admin-nav-card-title">首頁輪播圖片管理</span>
            <span className="admin-nav-card-desc">新增、編輯、排序、預覽首頁輪播圖片</span>
          </Link>
        </li>
      </ul>
    </div>
  )
}
