import axios from 'axios';
import { FileItem } from './store';

const api = axios.create({
  baseURL: '/api',
});

export const fileApi = {
  // Get files
  getFiles: async (userId: string, parentId?: string): Promise<FileItem[]> => {
    let url = `/files?userId=${userId}`;
    if (parentId) url += `&parentId=${parentId}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Upload file
  uploadFile: async (file: File, userId: string, parentId?: string): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    if (parentId) formData.append('parentId', parentId);

    const response = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Create folder
  createFolder: async (name: string, userId: string, parentId?: string): Promise<FileItem> => {
    const response = await api.post('/folders/create', {
      name: name.trim(),
      userId,
      parentId
    });
    return response.data.folder;
  },

  // Toggle star
  toggleStar: async (fileId: string): Promise<FileItem> => {
    const response = await api.patch(`/files/${fileId}/star`);
    return response.data;
  },

  // Toggle trash
  toggleTrash: async (fileId: string): Promise<FileItem> => {
    const response = await api.patch(`/files/${fileId}/trash`);
    return response.data;
  },

  // Delete permanently
  deleteFile: async (fileId: string): Promise<string> => {
    const response = await api.delete(`/files/${fileId}/delete`);
    return response.data.deleteId;
  },

  // Empty trash
  emptyTrash: async (): Promise<void> => {
    await api.delete('/files/empty-trash');
  },

  // Download file
  downloadFile: async (file: FileItem): Promise<void> => {
    let url: string;
    
    if (file.type.startsWith('image/')) {
      url = `${process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}/tr:q-100,orig-true/${file.path}`;
    } else {
      url = file.fileUrl;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};