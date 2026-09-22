import { getAuth } from '@/lib/auth';

function adminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email) {
  if (!email) return false;
  return adminEmailSet().has(String(email).toLowerCase());
}

export async function getAdminUser() {
  const { data: session } = await getAuth().getSession();
  const user = session?.user ?? null;
  if (!user || !isAdminEmail(user.email)) {
    return null;
  }
  return user;
}
