"use client"

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/lib/store';

export default function Breadcrumbs() {
  const { getBreadcrumbs, setCurrentFolder, view } = useFileStore();
  
  if (view !== 'home') return null;
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex items-center gap-1 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentFolder(null)}
        className="h-8 px-2"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Button>
      
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder(crumb.id)}
            className="h-8 px-2"
          >
            {crumb.name}
          </Button>
        </div>
      ))}
    </div>
  );
}