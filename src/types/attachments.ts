
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface AttachmentUploadResult {
  success: boolean;
  attachment?: Attachment;
  error?: Error;
  url?: string;
}
