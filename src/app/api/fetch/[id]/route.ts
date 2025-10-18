// GET /api/fetch/[id] - Fetch markdown content from S3

import { NextRequest, NextResponse } from 'next/server';
import { fetchFromS3, isS3Configured } from '@/lib/s3';
import { validateId } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check S3 configuration
    if (!isS3Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'S3 is not properly configured',
        },
        { status: 500 }
      );
    }

    // Get and validate ID
    const { id } = await params;

    if (!validateId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    }

    // Fetch from S3
    const result = await fetchFromS3(id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || MESSAGES.NOT_FOUND,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        content: result.content,
        metadata: result.metadata,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
      },
      { status: 500 }
    );
  }
}
