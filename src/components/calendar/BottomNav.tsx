'use client';

import { Calendar, ClipboardList, Search, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { icon: Calendar, label: '캘린더', path: '/calendar/month' },
    { icon: ClipboardList, label: '일정관리', path: '/calendar/tasks' },
    { icon: User, label: '프로필', path: '/calendar/profile' },
  ];

  return (
    <nav className="bottom-nav glass">
      <div className="nav-items">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path.split('/').slice(0, 3).join('/'));
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: var(--tab-bar-height);
          padding-bottom: var(--safe-area-bottom);
          background: rgba(255, 255, 255, 0.9);
          border-top: 1px solid var(--border-subtle);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-items {
          display: flex;
          width: 100%;
          max-width: 600px;
          height: 100%;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .nav-item span {
          font-size: 10px;
          font-weight: var(--weight-medium);
        }

        .nav-item.active {
          color: var(--accent-primary);
        }

        .nav-item:active {
          transform: scale(0.9);
        }
      `}</style>
    </nav>
  );
}
