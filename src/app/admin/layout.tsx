import { getCurrentUser } from '@/lib/auth-utils';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const userName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Administrador Demo';

  return (
    <AdminLayoutClient userName={userName}>
      {children}
    </AdminLayoutClient>
  );
}
