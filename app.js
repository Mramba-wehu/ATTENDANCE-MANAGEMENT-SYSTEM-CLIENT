import express from 'express';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:5000/api/',
    changeOrigin: true,
    logLevel: 'debug',
  })
);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*frontend', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(5173, () => {
  console.log('Frontend preview running at http://localhost:5173');
});