"use client"

import { Home, Star, Trash2, LogOut, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/lib/store';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { view, setView, setCurrentFolder, getStarredCount, getTrashCount } = useFileStore();
  const { signOut } = useClerk();
  const router = useRouter();

  const starredCount = getStarredCount();
  const trashCount = getTrashCount();

  const handleViewChange = (newView: 'home' | 'starred' | 'trash') => {
    setView(newView);
    if (newView !== 'home') {
      setCurrentFolder(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, count: null },
    { id: 'starred', label: 'Starred', icon: Star, count: starredCount },
    { id: 'trash', label: 'Trash', icon: Trash2, count: trashCount },
  ] as const;

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <img
        src="/favicon.svg"
        alt="Logo"
        className="h-8 w-8"
      />
          <h1 className="text-xl font-bold">CloudStore</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={view === item.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleViewChange(item.id)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="ml-auto bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </Button>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}