import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const url = req.headers.get('X-Upload-Url');
    const contentType = req.headers.get('Content-Type') || 'application/octet-stream';

    if (!url) {
      return NextResponse.json({ error: 'Missing X-Upload-Url header' }, { status: 400 });
    }

    // Read body as buffer to avoid streaming issues (duplex: 'half' can cause 501 in some envs)
    const fileBuffer = await req.arrayBuffer();

    // Forward the request to S3
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: fileBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`S3 Upload Proxy Failed: ${response.status} ${errorText}`);
      return NextResponse.json({ error: `Upload failed: ${response.status}` }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
