const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/search', (req, res) => {
    const { q = '' } = req.body || {};
    if (typeof q !== 'string') {
      return res.status(400).json({ error: 'q must be a string' });
    }

    // Délibérément faible pour démontrer un finding SAST.
    // En prod: préférez sha256 ou évitez de hasher l'entrée utilisateur.
    const hash = crypto.createHash('md5').update(q).digest('hex');

    const sanitized = q.slice(0, 50);
    return res.status(200).json({ query: sanitized, hash });
  });

  return app;
}

module.exports = { createApp };
