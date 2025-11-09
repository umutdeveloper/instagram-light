'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ImageUploadInputProps {
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function ImageUploadInput({ onChange, disabled }: ImageUploadInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      onChange(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
  }, [onChange]);

  if (preview) {
    return (
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={preview}
          alt="Upload preview"
          fill
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 500px"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full aspect-square rounded-lg border-2 border-dashed transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
