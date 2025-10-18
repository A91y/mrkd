// Application constants

export const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB in bytes
export const MAX_CONTENT_LENGTH = MAX_CONTENT_SIZE; // For character count

export const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
};

export const ID_LENGTH = 10; // Length of generated IDs

export const STORAGE_KEYS = {
  DRAFT: 'mrkd-draft',
  THEME: 'mrkd-theme',
};

export const AUTOSAVE_DELAY = 2000; // 2 seconds

export const S3_CONFIG = {
  FOLDER_PREFIX: 'markdown/',
  CONTENT_TYPE: 'text/markdown',
};

export const MESSAGES = {
  UPLOAD_SUCCESS: 'Markdown shared successfully!',
  UPLOAD_ERROR: 'Failed to share markdown. Please try again.',
  COPY_SUCCESS: 'Link copied to clipboard!',
  COPY_ERROR: 'Failed to copy link.',
  CONTENT_TOO_LARGE: 'Content is too large. Maximum size is 1MB.',
  INVALID_CONTENT: 'Invalid content provided.',
  NOT_FOUND: 'Markdown not found.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
};