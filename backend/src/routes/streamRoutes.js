const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

function toDropboxRawUrl(url) {
  try {
    let u = String(url).trim();
    // Normalize common variants
    if (u.startsWith('https:/www.dropbox.com')) {
      u = u.replace('https:/www.dropbox.com', 'https://www.dropbox.com');
    }
    if (u.startsWith('http:/www.dropbox.com')) {
      u = u.replace('http:/www.dropbox.com', 'http://www.dropbox.com');
    }
    const full = new URL(u);
    full.searchParams.set('dl', '1');
    return full.toString().replace('www.dropbox.com', 'dl.dropboxusercontent.com');
  } catch (e) {
    return url;
  }
}

// Simple MP4 streaming/transcoding endpoint.
// Takes a source URL (e.g., Dropbox) and outputs progressive MP4 chunks.
router.get('/mp4', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url query param' });
  }

  const inputUrl = toDropboxRawUrl(url);

  // Set streaming headers for progressive MP4
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Transfer-Encoding', 'chunked');
  // Allow seeking in some browsers; not perfect but helps
  res.setHeader('Accept-Ranges', 'bytes');
  // Caching can be tuned; for now, disable to avoid stale content
  res.setHeader('Cache-Control', 'no-store');

  const args = [
    '-hide_banner',
    '-loglevel', 'error',
    '-i', inputUrl,
    // Video: H.264 for best browser compatibility
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p',
    // Audio: AAC widely supported
    '-c:a', 'aac',
    '-b:a', '128k',
    // Fragmented MP4 for streaming (no full moov at end)
    '-movflags', 'frag_keyframe+empty_moov',
    // Output format
    '-f', 'mp4',
    'pipe:1'
  ];

  const ff = spawn(ffmpegPath, args);

  ff.on('error', (err) => {
    console.error('ffmpeg spawn error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start ffmpeg' });
    } else {
      res.end();
    }
  });

  ff.stderr.on('data', (data) => {
    // Useful to keep for debugging
    console.error('ffmpeg:', data.toString());
  });

  ff.stdout.pipe(res);

  ff.on('close', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg exited with code ${code}`);
      if (!res.headersSent) {
        res.status(500).end();
      } else {
        res.end();
      }
    } else {
      if (!res.headersSent) {
        res.status(200).end();
      } else {
        res.end();
      }
    }
  });

  // If client disconnects, kill ffmpeg
  req.on('close', () => {
    try { ff.kill('SIGKILL'); } catch {}
  });
});

module.exports = router;