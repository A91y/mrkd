// S3 client utilities

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3_CONFIG } from './constants';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.S3_BUCKET_NAME || '';

/**
 * Upload markdown content to S3
 */
export async function uploadToS3(id: string, content: string): Promise<boolean> {
  try {
    const key = `${S3_CONFIG.FOLDER_PREFIX}${id}.md`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: S3_CONFIG.CONTENT_TYPE,
      Metadata: {
        createdAt: new Date().toISOString(),
        size: String(new Blob([content]).size),
      },
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return false;
  }
}

/**
 * Fetch markdown content from S3
 */
export async function fetchFromS3(id: string): Promise<{
  success: boolean;
  content?: string;
  metadata?: {
    createdAt: string;
    size: number;
  };
  error?: string;
}> {
  try {
    const key = `${S3_CONFIG.FOLDER_PREFIX}${id}.md`;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    // Convert stream to string
    const content = await streamToString(response.Body);

    // Extract metadata
    const metadata = {
      createdAt: response.Metadata?.createdat || new Date().toISOString(),
      size: parseInt(response.Metadata?.size || '0', 10),
    };

    return {
      success: true,
      content,
      metadata,
    };
  } catch (error: unknown) {
    console.error('Error fetching from S3:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'NoSuchKey') {
      return {
        success: false,
        error: 'Content not found',
      };
    }

    return {
      success: false,
      error: 'Failed to fetch content',
    };
  }
}

/**
 * Convert stream to string
 */
async function streamToString(stream: unknown): Promise<string> {
  const chunks: Uint8Array[] = [];

  // Type guard for async iterable
  if (stream && typeof stream === 'object' && Symbol.asyncIterator in stream) {
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
  }

  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );
}
