import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const contentType = req.headers.get('content-type') || 'application/octet-stream';
    
    // Forward the request to S3
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: req.body,
      // @ts-ignore: Required for streaming bodies in Node.js fetch
      duplex: 'half', 
    });

    if (!response.ok) {
      console.error(`S3 Upload Proxy Failed: ${response.status} ${response.statusText}`);
      return NextResponse.json({ error: 'Upload failed' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
