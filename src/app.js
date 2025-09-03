const express = require('express');
const helmet = require('helmet');
const crypto = require('crypto');

function createApp() {
  const app = express();

  // Helmet globalement (bonnes pratiques par défaut)
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  // Page d'accueil avec des liens pour que ZAP découvre les routes
  app.get('/', (req, res) => {
    res
      .status(200)
      .type('html')
      .send(`
        <!doctype html>
        <html>
          <head><title>DevSecOps Lab</title></head>
          <body>
            <h1>DevSecOps Lab</h1>
            <ul>
              <li><a href="/health">/health</a></li>
              <li><a href="/insecure-demo">/insecure-demo</a> (démo DAST)</li>
            </ul>
          </body>
        </html>
      `);
  });

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/search', (req, res) => {
    const { q = '' } = req.body || {};
    if (typeof q !== 'string') {
      return res.status(400).json({ error: 'q must be a string' });
    }

    // Faible pour démo SAST (MD5) — à corriger en SHA-256 dans un commit suivant
    const hash = crypto.createHash('md5').update(q).digest('hex');

    const sanitized = q.slice(0, 50);
    return res.status(200).json({ query: sanitized, hash });
  });

  // Route "insecure" pour déclencher des findings ZAP (DAST)
  app.get('/insecure-demo', (req, res) => {
    // Retire certains headers ajoutés par Helmet afin que ZAP les signale comme manquants
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('Referrer-Policy');
    res.removeHeader('X-DNS-Prefetch-Control');
    res.removeHeader('Permissions-Policy'); // selon version de helmet

    // Réintroduit un header bavard que Helmet masque normalement
    res.setHeader('X-Powered-By', 'Express');

    // A tester: ajouter un cookie sans attributs sécurisés (détecté par ZAP, mais potentiellement par SAST aussi)
    // res.setHeader('Set-Cookie', 'session=abc123; Path=/');

    res
      .status(200)
      .type('html')
      .send(`
        <!doctype html>
        <html>
          <head><title>Insecure Demo</title></head>
          <body>
            <h1>Insecure Demo</h1>
            <p>Cette page retire volontairement certains en-têtes de sécurité pour la démo DAST.</p>
          </body>
        </html>
      `);
  });

  return app;
}

module.exports = { createApp };
