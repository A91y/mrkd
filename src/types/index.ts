// Type definitions for mrkd

export interface MarkdownContent {
  content: string;
  metadata?: {
    createdAt: string;
    size: number;
  };
}

export interface UploadResponse {
  success: boolean;
  id?: string;
  url?: string;
  error?: string;
}

export interface FetchResponse {
  success: boolean;
  content?: string;
  metadata?: {
    createdAt: string;
    size: number;
    isEncrypted?: boolean;
    isEditable?: boolean;
    name?: string;
    version?: string;
  };
  error?: string;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export interface CopyButtonProps {
  text: string;
  label?: string;
}

export interface ThemeToggleProps {
  className?: string;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onShare: (encryptionKey?: string, documentName?: string, editKey?: string) => void;
  isUploading?: boolean;
}

export interface DecryptModalProps {
  isOpen: boolean;
  onDecrypt: (key: string) => void;
  onCancel: () => void;
  error?: string;
}

export interface MarkdownPreviewProps {
  content: string;
}

export interface MarkdownViewerProps {
  content: string;
  metadata?: {
    name?: string;
    isEditable?: boolean;
    version?: string;
  };
  onEdit?: () => void;
}