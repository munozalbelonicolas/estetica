import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayoutClient userName="Administrador">
      {children}
    </AdminLayoutClient>
  );
}
