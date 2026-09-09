import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleContactSubmission } from './server/contactHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Endpoint for Contact & Quotes
app.post('/api/contact', async (req, res) => {
  try {
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await handleContactSubmission(req.body, clientIp);
    return res.status(result.status).json(result);
  } catch (error: any) {
    console.error('API Contact route error:', error);
    return res.status(500).json({
      ok: false,
      status: 500,
      message: 'Internal server error processing inquiry.',
    });
  }
});

// Serve compiled static assets from dist/
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback: All unmatched GET routes return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Plexivia server running on http://localhost:${PORT}`);
});
