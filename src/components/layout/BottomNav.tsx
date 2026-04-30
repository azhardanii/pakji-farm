'use client';

import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { icon: '🏠', label: 'Dasbor', path: '/' },
  { icon: '🐐', label: 'Kambing', path: '/kambing' },
  { icon: '💘', label: 'Reproduksi', path: '/reproduksi' },
  { icon: '🌿', label: 'Pakan', path: '/pakan' },
  { icon: '💊', label: 'Kesehatan', path: '/kesehatan' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-primary-d grid grid-cols-5 px-1.5 pt-2 pb-[18px] z-[200]">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => router.push(item.path)}
          className="flex flex-col items-center gap-[3px] py-1 px-0.5 cursor-pointer transition-all"
        >
          <div
            className={`w-8 h-8 flex items-center justify-center text-[17px] rounded-[9px] transition-all ${
              isActive(item.path) ? 'bg-white/15' : ''
            }`}
          >
            {item.icon}
          </div>
          <span
            className={`text-[9px] tracking-wider ${
              isActive(item.path)
                ? 'text-white/90 font-bold'
                : 'text-white/45 font-medium'
            }`}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
