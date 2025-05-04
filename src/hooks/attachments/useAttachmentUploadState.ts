
import { useState } from "react";

export interface UploadProgressState {
  isUploading: boolean;
  progress: number;
}

export function useAttachmentUploadState() {
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    isUploading: false,
    progress: 0
  });
  
  const startUpload = () => {
    setUploadState({
      isUploading: true,
      progress: 10 // Initial progress
    });
  };
  
  const updateProgress = (progress: number) => {
    setUploadState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100) // Ensure between 0-100
    }));
  };
  
  const finishUpload = (success: boolean = true) => {
    if (success) {
      // Show 100% before resetting
      setUploadState({ isUploading: true, progress: 100 });
      // Reset after delay to show completion
      setTimeout(() => {
        setUploadState({ isUploading: false, progress: 0 });
      }, 1000);
    } else {
      // Reset immediately on failure
      setUploadState({ isUploading: false, progress: 0 });
    }
  };
  
  return {
    ...uploadState,
    startUpload,
    updateProgress,
    finishUpload
  };
}
