const request = require('supertest');
const { createApp } = require('../src/app');

describe('app', () => {
  const app = createApp();

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.time).toBe('string');
  });

  it('POST /search returns hash of query', async () => {
    const res = await request(app)
      .post('/search')
      .send({ q: 'hello' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.query).toBe('hello');
    expect(res.body.hash).toMatch(/^[a-f0-9]{32}$/); // MD5
  });

  it('POST /search validates input type', async () => {
    const res = await request(app)
      .post('/search')
      .send({ q: 123 })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
  });
});
