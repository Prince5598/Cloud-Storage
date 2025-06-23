"use client"

import { useState } from 'react';
import { FileItem } from '@/lib/store';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Star, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { fileApi } from '@/lib/api';
import { useFileStore } from '@/lib/store';
import { toast } from 'sonner';

interface ImagePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export default function ImagePreview({ file, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const { updateFile } = useFileStore();

  const handleStarToggle = async () => {
    try {
      const updatedFile = await fileApi.toggleStar(file.id);
      updateFile(file.id, updatedFile);
      toast.success(updatedFile.isStarred ? 'Added to starred' : 'Removed from starred');
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const handleDownload = async () => {
    try {
      toast.success('Download started');
      await fileApi.downloadFile(file);
      toast.success('Download completed');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleTrashToggle = async () => {
    try {
      const updatedFile = await fileApi.toggleTrash(file.id);
      updateFile(file.id, updatedFile);
      toast.success(updatedFile.isTrash ? 'Moved to trash' : 'Restored from trash');
      onClose();
    } catch (error) {
      toast.error('Failed to update trash status');
    }
  };

  const imageUrl = file.thumbnailUrl || file.fileUrl;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">{file.name}</h2>
            <p className="text-sm text-muted-foreground">
              {Math.round(file.size / 1024)} KB
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-2" />
            
            <Button variant="ghost" size="sm" onClick={handleStarToggle}>
              <Star className={`h-4 w-4 ${file.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleTrashToggle}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <img
              src={imageUrl}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}