import { useState, useCallback } from "react";
import type { ChatDocument } from "../components/ChatInput";

export function useChatAttachments() {
  const [images, setImages] = useState<string[]>([]);
  const [documents, setDocuments] = useState<ChatDocument[]>([]);

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (!result) return;

        if (file.type.startsWith("image/")) {
          setImages(prev => [...prev, result]);
        } else {
          const base64 = result.split(",")[1] || result;
          setDocuments(prev => [...prev, {
            base64,
            mimeType: file.type || "application/octet-stream",
            fileName: file.name,
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAttachments = useCallback(() => {
    setImages([]);
    setDocuments([]);
  }, []);

  return {
    images,
    documents,
    handleFileChange,
    removeImage,
    removeDocument,
    clearAttachments
  };
}
