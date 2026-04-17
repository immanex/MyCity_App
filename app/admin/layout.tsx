'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Users, Star, AlertTriangle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties/pending', label: 'Verify Properties', icon: CheckSquare },
    { href: '/admin/agents/pending', label: 'Approve Agents', icon: Users },
    { href: '/admin/featured', label: 'Featured', icon: Star },
    { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="text-2xl font-serif font-bold text-emerald-400">
            MyCity Admin
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
