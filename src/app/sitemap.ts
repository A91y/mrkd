import { MetadataRoute } from 'next';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Helper to list all documents from S3
async function listAllDocuments(): Promise<string[]> {
  try {
    // Check if S3 is configured
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.S3_BUCKET_NAME) {
      console.log('S3 not configured, returning empty document list');
      return [];
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: 'markdown/',
      MaxKeys: 1000, // Adjust based on your needs
    });

    const response = await s3Client.send(command);

    if (!response.Contents) {
      return [];
    }

    // Extract document IDs from keys (e.g., "markdown/abc123.md" -> "abc123")
    const documentIds = response.Contents
      .map(item => {
        const key = item.Key || '';
        const match = key.match(/markdown\/(.+)\.md$/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => id !== null);

    return documentIds;
  } catch (error) {
    console.error('Error listing documents for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // Get all document IDs
    const documentIds = await listAllDocuments();

    // Add document routes to sitemap
    const documentRoutes: MetadataRoute.Sitemap = documentIds.map(id => ({
      url: `${baseUrl}/view/${id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...routes, ...documentRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the static routes
    return routes;
  }
}

// Revalidate sitemap every hour
export const revalidate = 3600;
