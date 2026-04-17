'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, MessageSquare, PlusCircle } from 'lucide-react';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agent/listings', label: 'My Listings', icon: List },
    { href: '/agent/listings/new', label: 'Add Listing', icon: PlusCircle },
    { href: '/agent/inquiries', label: 'Inquiries', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="text-2xl font-serif font-bold text-emerald-700">
            MyCity Agent
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
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
