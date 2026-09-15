'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Sparkles,
  UserCog,
  DoorOpen,
  FileText,
  Camera,
  BarChart3,
  UserCircle,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import './AdminLayout.css';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/agenda', label: 'Agenda', icon: Calendar },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/tratamientos', label: 'Tratamientos', icon: Sparkles },
  { href: '/admin/profesionales', label: 'Profesionales', icon: UserCog },
  { href: '/admin/consultorios', label: 'Consultorios', icon: DoorOpen },
  { href: '/admin/historias', label: 'Historias', icon: FileText },
  { href: '/admin/fotos', label: 'Fotos', icon: Camera },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/usuarios', label: 'Usuarios', icon: UserCircle },
  { href: '/admin/auditoria', label: 'Auditoría', icon: ClipboardList },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayoutClient({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="admin-sidebar__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${mobileOpen ? 'admin-sidebar--mobile-open' : ''}`}
      >
        <div className="admin-sidebar__header">
          <Link href="/admin" className="admin-sidebar__logo">
            {!collapsed && (
              <>
                <span className="admin-sidebar__logo-text">Estética</span>
                <span className="admin-sidebar__logo-accent">Studio</span>
              </>
            )}
            {collapsed && <span className="admin-sidebar__logo-short">ES</span>}
          </Link>
          <button
            className="admin-sidebar__collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Colapsar menú"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${
                isActive(item.href, item.exact) ? 'admin-sidebar__link--active' : ''
              }`}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link
            href="/"
            className="admin-sidebar__link"
            title={collapsed ? 'Ver sitio' : undefined}
          >
            <ChevronLeft size={20} />
            {!collapsed && <span>Ver sitio</span>}
          </Link>
          <button
            className="admin-sidebar__link admin-sidebar__link--danger"
            onClick={() => signOut({ callbackUrl: '/' })}
            title={collapsed ? 'Cerrar sesión' : undefined}
          >
            <LogOut size={20} />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-topbar__menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="admin-topbar__spacer" />
          <div className="admin-topbar__user">
            <div className="admin-topbar__avatar">{userName.charAt(0)}</div>
            <span className="admin-topbar__username">{userName}</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
