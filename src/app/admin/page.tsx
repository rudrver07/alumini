import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Operations Dashboard | ILLUMINATE Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient initialSession={session} />;
}
