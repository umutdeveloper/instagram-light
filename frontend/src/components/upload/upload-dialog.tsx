'use client';

import { useState } from 'react';
import { useAuthStore } from '@/src/stores/auth-store';
import { createApiClients } from '@/src/lib/api-client';
import { getUserIdFromToken } from '@/src/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadInput } from './image-upload-input';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const { token } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFile || !token) return;

    setIsUploading(true);
    setError(null);
    setIsPending(false);

    try {
      const apiClient = createApiClients(token);
      const userId = getUserIdFromToken(token);

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Step 1: Upload the file
      const uploadResponse = await apiClient.upload.apiUploadPost({
        file: selectedFile,
      });

      if (!uploadResponse.mediaUrl) {
        throw new Error('Failed to upload image');
      }

      // Step 2: Create the post with the uploaded media URL
      await apiClient.posts.apiPostsPost({
        post: {
          userId: userId,
          mediaUrl: uploadResponse.mediaUrl,
          caption: caption.trim() || undefined,
        },
      });

      // Check for moderation status (if API returns it in future)
      // For now, we'll assume successful posts might be pending moderation
      // You can check response headers or specific fields if backend provides them
      
      // Success - close dialog and refresh feed
      handleClose();
      onSuccess?.();
    } catch (err) {
      console.error('Upload failed:', err);
      
      // Check if it's a moderation error (you might need to adjust based on actual API response)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      
      if (errorMessage.includes('moderation') || errorMessage.includes('pending') || errorMessage.includes('flagged')) {
        setIsPending(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setCaption('');
      setError(null);
      setIsPending(false);
      onOpenChange(false);
    }
  };

  const canSubmit = selectedFile && !isUploading && caption.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Upload a photo and add a caption to share with your followers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-4 overflow-y-auto flex-1">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <ImageUploadInput
              onChange={setSelectedFile}
              disabled={isUploading}
            />
          </div>

          {/* Caption Input */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {caption.length}/500
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pending Moderation Alert */}
          {isPending && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your post has been submitted and is under review. It will appear in your feed once approved.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
