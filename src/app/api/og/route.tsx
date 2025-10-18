import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Shared Markdown Document';
    const author = searchParams.get('author') || 'Anonymous';
    const preview = searchParams.get('preview') || '';
    const id = searchParams.get('id') || '';

    // Truncate preview text to fit nicely
    const truncatedPreview = preview.length > 180
      ? preview.substring(0, 180) + '...'
      : preview;

    // Fetch the logo
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/logo.png`;

    let logoData = '';
    try {
      const logoResponse = await fetch(logoUrl);
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString('base64');
      logoData = `data:image/png;base64,${logoBase64}`;
    } catch (error) {
      console.error('Error fetching logo:', error);
      // Will fall back to text "M" if logo fails to load
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            padding: '60px 80px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-100px',
              left: '-100px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
            {logoData ? (
              <img
                src={logoData}
                alt="mrkd logo"
                width={60}
                height={60}
                style={{
                  borderRadius: '16px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                M
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                }}
              >
                mrkd
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: '#94a3b8',
                  marginTop: '-4px',
                }}
              >
                Simple Markdown Sharing
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center', zIndex: 1, maxWidth: '900px' }}>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.2,
                display: 'flex',
                flexWrap: 'wrap',
                maxHeight: '200px',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>

            {truncatedPreview && (
              <div
                style={{
                  fontSize: '24px',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                  display: 'flex',
                  flexWrap: 'wrap',
                }}
              >
                {truncatedPreview}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              zIndex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  fontSize: '24px',
                  color: '#3b82f6',
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '20px', color: '#ffffff', fontWeight: 600 }}>
                  {author}
                </div>
                <div style={{ fontSize: '16px', color: '#64748b' }}>
                  Document Author
                </div>
              </div>
            </div>

            {id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '16px', color: '#64748b' }}>
                  ID:
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: '#3b82f6',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                  }}
                >
                  {id}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
