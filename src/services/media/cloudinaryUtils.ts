/**
 * Cloudinary Utility Functions (Client-safe)
 * These functions don't require the Cloudinary SDK and can be used in client components
 * [Source: docs/stories/4.4.md]
 */

// =============================================================================
// CONSTANTS (shared with cloudinary.service.ts)
// =============================================================================

/** Maximum file size in bytes (10MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum file size in MB for display */
export const MAX_FILE_SIZE_MB = 10;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

/** Allowed document MIME types (PDF removed - not supported) */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

/** All allowed MIME types */
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const;

/** Allowed file extensions (PDF removed - not supported) */
export const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'doc',
  'docx',
  'xls',
  'xlsx',
] as const;

// =============================================================================
// TYPES
// =============================================================================

export type AllowedMimeType = (typeof ALLOWED_FILE_TYPES)[number];
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

export interface IFileValidationResult {
  valid: boolean;
  error?: string;
}

// =============================================================================
// VALIDATION FUNCTIONS (Client-safe)
// =============================================================================

/**
 * Validate file size
 * AC: 3 - File size limit (10MB)
 */
export function validateFileSize(size: number): IFileValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Kích thước tệp vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB. Kích thước hiện tại: ${(size / (1024 * 1024)).toFixed(2)}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type by MIME type
 */
export function validateFileType(mimeType: string): IFileValidationResult {
  if (!ALLOWED_FILE_TYPES.includes(mimeType as AllowedMimeType)) {
    return {
      valid: false,
      error: `Loại tệp không được hỗ trợ: ${mimeType}. Các định dạng được hỗ trợ: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): IFileValidationResult {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext as AllowedExtension)) {
    return {
      valid: false,
      error: `Phần mở rộng tệp không được hỗ trợ. Các định dạng được hỗ trợ: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }
  return { valid: true };
}

/**
 * Validate file for upload
 * Combines size, type, and extension validation
 */
export function validateFile(
  file: { size: number; type: string; name: string }
): IFileValidationResult {
  // Validate size
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.valid) return sizeResult;

  // Validate MIME type
  const typeResult = validateFileType(file.type);
  if (!typeResult.valid) return typeResult;

  // Validate extension
  const extResult = validateFileExtension(file.name);
  if (!extResult.valid) return extResult;

  return { valid: true };
}

/**
 * Check if file is an image based on MIME type
 */
export function isImageFile(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number]);
}

/**
 * Check if file is a document based on MIME type
 */
export function isDocumentFile(mimeType: string): boolean {
  return ALLOWED_DOCUMENT_TYPES.includes(mimeType as (typeof ALLOWED_DOCUMENT_TYPES)[number]);
}

// =============================================================================
// URL UTILITY FUNCTIONS (Client-safe)
// =============================================================================

/**
 * Get thumbnail URL for an image
 * Uses Cloudinary transformations for optimized thumbnails
 *
 * @param url - Original Cloudinary URL
 * @param width - Thumbnail width (default: 200)
 * @param height - Thumbnail height (default: 200)
 * @returns Transformed thumbnail URL
 */
export function getThumbnailUrl(
  url: string,
  width: number = 200,
  height: number = 200
): string {
  // Only transform Cloudinary URLs
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Insert transformation before /upload/
  return url.replace(
    '/upload/',
    `/upload/c_thumb,w_${width},h_${height},f_auto,q_auto/`
  );
}

/**
 * Extract public ID from Cloudinary URL
 *
 * @param url - Cloudinary URL
 * @returns Public ID or null if not a valid Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!url.includes('cloudinary.com')) {
    return null;
  }

  // Match pattern: /upload/v{version}/{public_id}.{format}
  // or /upload/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
}

/**
 * Get file extension from filename or URL
 */
export function getFileExtension(filenameOrUrl: string): string {
  const ext = filenameOrUrl.split('.').pop()?.toLowerCase() || '';
  // Remove query params if present
  return ext.split('?')[0];
}

/**
 * Check if URL is an image based on extension
 */
export function isImageUrl(url: string): boolean {
  const ext = getFileExtension(url);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
}

/**
 * Check if URL is a document based on extension
 */
export function isDocumentUrl(url: string): boolean {
  const ext = getFileExtension(url);
  return ['doc', 'docx', 'xls', 'xlsx'].includes(ext);
}
