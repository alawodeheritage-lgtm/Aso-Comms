// src/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { api } from '../api/axios';

interface ImageUploadProps {
  onUploadComplete: (files: any[]) => void;
  maxFiles?: number;
  accept?: string;
  uploadType?: 'repair' | 'complaint' | 'profile' | 'general';
  existingImages?: any[];
  onRemove?: (publicId: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadComplete,
  maxFiles = 5,
  accept = 'image/*',
  uploadType = 'general',
  existingImages = [],
  onRemove
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('uploadType', uploadType);

    try {
      const response = await api.post('/uploads/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });

      if (response.data.success) {
        const newImages = response.data.files;
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onUploadComplete(updatedImages);
        setUploadProgress(100);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];
    
    if (imageToRemove.publicId) {
      try {
        await api.delete(`/uploads/${imageToRemove.publicId}`);
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }

    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUploadComplete(updatedImages);
    
    if (onRemove && imageToRemove.publicId) {
      onRemove(imageToRemove.publicId);
    }
  };

  return (
    <div className="space-y-3">
      <div 
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all ${
          uploading ? 'border-blue-300 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxFiles}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className={`cursor-pointer flex flex-col items-center gap-2 ${
            images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span className="material-symbols-outlined text-3xl text-slate-400">
            cloud_upload
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {uploading ? 'Uploading...' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-slate-500">
              {images.length >= maxFiles 
                ? `Maximum ${maxFiles} files reached`
                : `Up to ${maxFiles} files (max 10MB each)`}
            </p>
          </div>
        </label>

        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{uploadProgress}%</p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image.url} 
                alt={`Upload ${index + 1}`}
                className="w-full h-24 sm:h-28 object-cover rounded-lg border border-slate-200"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              {image.originalName && (
                <p className="text-[8px] text-slate-500 truncate mt-0.5">{image.originalName}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;