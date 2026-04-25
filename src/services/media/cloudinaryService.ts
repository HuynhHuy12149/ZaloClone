/**
 * Cloudinary Service (Server-only)
 * Handles file uploads and deletions to Cloudinary CDN
 * AC: 1, 3 - File upload with size validation (10MB limit)
 *
 * NOTE: This module uses Node.js-specific APIs (fs, stream) and should only
 * be imported in server-side code (API routes, server components).
 * For client-safe utilities, import from './cloudinary.utils'
 *
 * [Source: docs/stories/4.4.md]
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

// Re-export client-safe utilities for convenience in server code
export * from './cloudinaryUtils';

// Import types and functions from utils for internal use
import {
  isImageFile,
  validateFile,
} from './cloudinaryUtils';

// =============================================================================
// CONSTANTS (Server-specific)
// =============================================================================

/** Cloudinary folder for transaction attachments */
export const CLOUDINARY_FOLDER = 'team_upload';

// =============================================================================
// TYPES (Server-specific)
// =============================================================================

export interface IUploadOptions {
  /** Optional subfolder within the main folder */
  folder?: string;
  /** Original filename for public_id generation */
  filename?: string;
  /** Resource type override */
  resourceType?: 'image' | 'raw' | 'auto';
}

export interface IUploadResult {
  /** Secure URL to the uploaded file */
  url: string;
  /** Cloudinary public ID for deletion */
  publicId: string;
  /** File format/extension */
  format: string;
  /** File size in bytes */
  size: number;
  /** Resource type (image or raw for documents) */
  resourceType: 'image' | 'raw';
  /** Original filename */
  originalFilename: string;
  /** Width (for images only) */
  width?: number;
  /** Height (for images only) */
  height?: number;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

let isConfigured = false;

/**
 * Configure Cloudinary SDK with environment variables
 * Must be called before any upload/delete operations
 */
export function configureCloudinary(): void {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

/**
 * Upload file to Cloudinary
 * AC: 1 - Upload files to Cloudinary
 *
 * @param buffer - File buffer
 * @param mimeType - File MIME type
 * @param originalFilename - Original filename
 * @param options - Upload options
 * @returns Upload result with URL and metadata
 */
export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  originalFilename: string,
  options: IUploadOptions = {}
): Promise<IUploadResult> {
  // Ensure Cloudinary is configured
  configureCloudinary();

  // Validate file
  const validation = validateFile({
    size: buffer.length,
    type: mimeType,
    name: originalFilename,
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Determine resource type
  const isImage = isImageFile(mimeType);
  const resourceType = options.resourceType || (isImage ? 'image' : 'raw');

  // Generate folder path
  const folder = options.folder
    ? `${CLOUDINARY_FOLDER}/${options.folder}`
    : CLOUDINARY_FOLDER;

  // Extract file extension
  const fileExtension = originalFilename.split('.').pop()?.toLowerCase() || '';
  const filenameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
  const timestamp = Date.now();

  // For raw resources (documents), include extension in public_id to preserve it in URL
  // For images, Cloudinary handles extension automatically
  const publicId = resourceType === 'raw'
    ? `${folder}/${filenameWithoutExt}_${timestamp}.${fileExtension}`
    : `${folder}/${filenameWithoutExt}_${timestamp}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        folder: undefined, // We include folder in public_id
        overwrite: false,
        unique_filename: false, // We handle uniqueness with timestamp
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(`Lỗi tải lên Cloudinary: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Không nhận được phản hồi từ Cloudinary'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          // For raw files, Cloudinary may not return format, use extracted extension
          format: result.format || fileExtension,
          size: result.bytes,
          resourceType: result.resource_type as 'image' | 'raw',
          originalFilename,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload multiple files to Cloudinary
 * Files are uploaded in parallel with concurrency limit
 *
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Array of upload results
 */
export async function uploadMultipleFiles(
  files: Array<{ buffer: Buffer; mimeType: string; filename: string }>,
  options: IUploadOptions = {}
): Promise<IUploadResult[]> {
  const MAX_CONCURRENT = 3;
  const results: IUploadResult[] = [];

  // Process files in batches
  for (let i = 0; i < files.length; i += MAX_CONCURRENT) {
    const batch = files.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map((file) =>
        uploadFile(file.buffer, file.mimeType, file.filename, options)
      )
    );
    results.push(...batchResults);
  }

  return results;
}

// =============================================================================
// DELETE FUNCTIONS
// =============================================================================

/**
 * Delete file from Cloudinary
 *
 * @param publicId - Cloudinary public ID
 * @param resourceType - Resource type (image or raw)
 */
export async function deleteFile(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> {
  // Ensure Cloudinary is configured
  configureCloudinary();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: resourceType },
      (error, result) => {
        if (error) {
          reject(new Error(`Lỗi xóa tệp từ Cloudinary: ${error.message}`));
          return;
        }

        if (result?.result !== 'ok' && result?.result !== 'not found') {
          reject(new Error(`Không thể xóa tệp: ${result?.result}`));
          return;
        }

        resolve();
      }
    );
  });
}

/**
 * Delete multiple files from Cloudinary
 *
 * @param publicIds - Array of public IDs to delete
 * @param resourceType - Resource type
 */
export async function deleteMultipleFiles(
  publicIds: string[],
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> {
  // Ensure Cloudinary is configured
  configureCloudinary();

  if (publicIds.length === 0) return;

  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(
      publicIds,
      { resource_type: resourceType },
      (error) => {
        if (error) {
          reject(new Error(`Lỗi xóa nhiều tệp từ Cloudinary: ${error.message}`));
          return;
        }
        resolve();
      }
    );
  });
}
