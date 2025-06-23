"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { fileApi } from '@/lib/api';
import { useFileStore } from '@/lib/store';
import { useUser } from '@clerk/nextjs';

interface CreateFolderProps {
  onClose: () => void;
}

export default function CreateFolder({ onClose }: CreateFolderProps) {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { user } = useUser();
  const { currentFolder, addFile } = useFileStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !folderName.trim()) return;

    setCreating(true);
    try {
      const folder = await fileApi.createFolder(folderName.trim(), user.id, currentFolder || undefined);
      addFile(folder);
      toast.success('Folder created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="folderName">Folder Name</Label>
        <Input
          id="folderName"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          autoFocus
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={!folderName.trim() || creating} className="flex-1">
          {creating ? 'Creating...' : 'Create Folder'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}