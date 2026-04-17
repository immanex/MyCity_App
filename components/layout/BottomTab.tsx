'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User } from 'lucide-react';

export default function BottomTab() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Explore', icon: Search, href: '/explore' },
    { name: 'Saved', icon: Heart, href: '/saved' },
    { name: 'Account', icon: User, href: '/account' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="glass rounded-[2rem] border border-white/20 shadow-2xl px-6 py-4 flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                isActive ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-emerald-700/10' : ''}`} />
              <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
