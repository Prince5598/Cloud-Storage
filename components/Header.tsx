"use client"

import { useState } from 'react';
import { Search, Plus, Upload, FolderPlus, Trash2, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFileStore } from '@/lib/store';
import { fileApi } from '@/lib/api';
import { toast } from 'sonner';
import FileUpload from './FileUpload';
import CreateFolder from './CreateFolder';
import Breadcrumbs from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { searchQuery, setSearchQuery, view, viewMode, setViewMode, getFilteredFiles, setFiles } = useFileStore();

  const handleEmptyTrash = async () => {
    try {
      await fileApi.emptyTrash();
      // Remove all trashed files from store
      const currentFiles = getFilteredFiles();
      const nonTrashedFiles = currentFiles.filter(file => !file.isTrash);
      setFiles(nonTrashedFiles);
      toast.success('Trash emptied successfully');
    } catch (error) {
      toast.error('Failed to empty trash');
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumbs />
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* View Mode Toggle */}
          {view !== 'trash' && (
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          {view === 'trash' && (
            <Button variant="outline" onClick={handleEmptyTrash}>
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          )}
          
          {view === 'home' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowUpload(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCreateFolder(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <FileUpload onClose={() => setShowUpload(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <CreateFolder onClose={() => setShowCreateFolder(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}