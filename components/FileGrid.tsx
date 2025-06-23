"use client"

import { useState } from 'react';
import { FileItem, useFileStore } from '@/lib/store';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  File as FileIcon, 
  Star, 
  MoreVertical,
  Download,
  Trash2,
  RotateCcw,
  Calendar,
  Music,
  Video,
  Archive,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { toast } from 'sonner';
import { fileApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import ImagePreview from './ImagePreview';

export default function FileGrid() {
  const { getFilteredFiles, setCurrentFolder, updateFile, removeFile, view, viewMode } = useFileStore();
  const [selectedImage, setSelectedImage] = useState<FileItem | null>(null);
  
  const files = getFilteredFiles();

  const getFileIcon = (file: FileItem) => {
    if (file.isFolder) return <Folder className="h-12 w-12 text-blue-500" />;
    
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return <ImageIcon className="h-12 w-12 text-green-500" />;
    if (type.includes('pdf')) return <FileText className="h-12 w-12 text-red-500" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-12 w-12 text-orange-500" />;
    if (type.includes('audio')) return <Music className="h-12 w-12 text-purple-500" />;
    if (type.includes('video')) return <Video className="h-12 w-12 text-pink-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-12 w-12 text-yellow-500" />;
    if (type.includes('javascript') || type.includes('html') || type.includes('css')) return <Code className="h-12 w-12 text-cyan-500" />;
    
    return <FileIcon className="h-12 w-12 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileClick = (file: FileItem) => {
    if (file.isFolder) {
      setCurrentFolder(file.id);
    } else if (file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleStarToggle = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedFile = await fileApi.toggleStar(file.id);
      updateFile(file.id, updatedFile);
      toast.success(updatedFile.isStarred ? 'Added to starred' : 'Removed from starred');
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const handleTrashToggle = async (file: FileItem) => {
    try {
      const updatedFile = await fileApi.toggleTrash(file.id);
      updateFile(file.id, updatedFile);
      toast.success(updatedFile.isTrash ? 'Moved to trash' : 'Restored from trash');
    } catch (error) {
      toast.error('Failed to update trash status');
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      await fileApi.deleteFile(file.id);
      removeFile(file.id);
      toast.success('File deleted permanently');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      toast.success('Download started');
      await fileApi.downloadFile(file);
      toast.success('Download completed');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const GridCard = ({ file }: { file: FileItem }) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col"
          onClick={() => handleFileClick(file)}
        >
          {/* Header with Star and More Actions */}
          <div className="flex justify-between items-start mb-4">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                file.isStarred 
                  ? 'opacity-100 text-yellow-500' 
                  : 'opacity-0 group-hover:opacity-100 hover:text-yellow-500'
              }`}
              onClick={(e) => handleStarToggle(file, e)}
            >
              <Star className={`h-4 w-4 ${file.isStarred ? 'fill-current' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!file.isFolder && (
                  <>
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => handleStarToggle(file, {} as React.MouseEvent)}>
                  <Star className="h-4 w-4 mr-2" />
                  {file.isStarred ? 'Remove from starred' : 'Add to starred'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {view === 'trash' ? (
                  <>
                    <DropdownMenuItem onClick={() => handleTrashToggle(file)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(file)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete permanently
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => handleTrashToggle(file)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Move to trash
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* File Icon/Thumbnail */}
          <div className="flex justify-center mb-4 flex-1 items-center">
            {file.thumbnailUrl && file.type.startsWith('image/') ? (
              <div className="relative">
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                {getFileIcon(file)}
              </div>
            )}
          </div>

          {/* File Information */}
          <div className="space-y-3">
            {/* File Name */}
            <div>
              <h3 className="font-semibold text-sm text-foreground truncate leading-tight" title={file.name}>
                {file.name}
              </h3>
            </div>

            {/* File Details - Now stacked vertically */}
            <div className="space-y-1">
              {/* File Size */}
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">
                  {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                </span>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {!file.isFolder && (
          <>
            <ContextMenuItem onClick={() => handleDownload(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={() => handleStarToggle(file, {} as React.MouseEvent)}>
          <Star className="h-4 w-4 mr-2" />
          {file.isStarred ? 'Remove from starred' : 'Add to starred'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {view === 'trash' ? (
          <>
            <ContextMenuItem onClick={() => handleTrashToggle(file)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleDelete(file)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete permanently
            </ContextMenuItem>
          </>
        ) : (
          <ContextMenuItem onClick={() => handleTrashToggle(file)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Move to trash
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );

  const ListRow = ({ file }: { file: FileItem }) => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg cursor-pointer border border-transparent hover:border-border transition-all duration-200"
          onClick={() => handleFileClick(file)}
        >
          {/* Icon/Thumbnail */}
          <div className="flex-shrink-0">
            {file.thumbnailUrl && file.type.startsWith('image/') ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                {file.isFolder ? (
                  <Folder className="h-6 w-6 text-blue-500" />
                ) : file.type.startsWith('image/') ? (
                  <ImageIcon className="h-6 w-6 text-green-500" />
                ) : file.type.includes('text') || file.type.includes('document') ? (
                  <FileText className="h-6 w-6 text-orange-500" />
                ) : (
                  <FileIcon className="h-6 w-6 text-gray-500" />
                )}
              </div>
            )}
          </div>

          {/* File Name */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h3>
          </div>

          {/* File Size */}
          <div className="w-20 text-sm text-muted-foreground text-center">
            {file.isFolder ? 'Folder' : formatFileSize(file.size)}
          </div>

          {/* Date */}
          <div className="w-32 text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
          </div>
         
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 transition-all duration-200 ${
                file.isStarred 
                  ? 'opacity-100 text-yellow-500' 
                  : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => handleStarToggle(file, e)}
            >
              <Star className={`h-4 w-4 ${file.isStarred ? 'fill-current' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!file.isFolder && (
                  <>
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => handleStarToggle(file, {} as React.MouseEvent)}>
                  <Star className="h-4 w-4 mr-2" />
                  {file.isStarred ? 'Remove from starred' : 'Add to starred'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {view === 'trash' ? (
                  <>
                    <DropdownMenuItem onClick={() => handleTrashToggle(file)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(file)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete permanently
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => handleTrashToggle(file)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Move to trash
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {!file.isFolder && (
          <>
            <ContextMenuItem onClick={() => handleDownload(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={() => handleStarToggle(file, {} as React.MouseEvent)}>
          <Star className="h-4 w-4 mr-2" />
          {file.isStarred ? 'Remove from starred' : 'Add to starred'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {view === 'trash' ? (
          <>
            <ContextMenuItem onClick={() => handleTrashToggle(file)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleDelete(file)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete permanently
            </ContextMenuItem>
          </>
        ) : (
          <ContextMenuItem onClick={() => handleTrashToggle(file)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Move to trash
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-muted-foreground mb-4">
          {view === 'trash' ? (
            <Trash2 className="h-12 w-12 mx-auto mb-4" />
          ) : view === 'starred' ? (
            <Star className="h-12 w-12 mx-auto mb-4" />
          ) : (
            <Folder className="h-12 w-12 mx-auto mb-4" />
          )}
        </div>
        <h3 className="text-lg font-medium mb-2">
          {view === 'trash' ? 'Trash is empty' : 
           view === 'starred' ? 'No starred files' : 
           'This folder is empty'}
        </h3>
        <p className="text-muted-foreground">
          {view === 'trash' ? 'Deleted files will appear here' : 
           view === 'starred' ? 'Star files to see them here' : 
           'Upload files or create folders to get started'}
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {files.map((file) => (
            <GridCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {/* List Header */}
          <div className="flex items-center gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-border">
            <div className="w-10"></div>
            <div className="flex-1">Name</div>
            <div className="w-20 text-right">Size</div>
            <div className="w-32">Modified</div>
            <div className="w-20"></div>
          </div>
          
          {/* List Items */}
          {files.map((file) => (
            <ListRow key={file.id} file={file} />
          ))}
        </div>
      )}

      {selectedImage && (
        <ImagePreview
          file={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}