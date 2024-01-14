const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const request = require('supertest');
const authMiddleware = require('../access/authAccess'); 

app.get('/protected', authMiddleware, (req, res) => {
  if (req.user) {
    res.json({ message: 'Authenticated' });
  } else {
    res.status(403).json({ message: 'Unauthorized' });
  }
});

describe('Authentication Middleware', () => {
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTViZTkxNzIyNjBhODQ0MjU3YWIyNSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTY5NzI2ODYyMywiZXhwIjoxNjk3MzU1MDIzfQ.OUY_QBaFQ5BV8xvscTi5mvdKs9Wm_TbmxZIkd0KXea8'; 
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MTViZTkxNzIyNjBhODQ0MjU3YWIyNSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTY5NzEwNjQwMywiZXhwIjoxNjk3MTkyODAzfQ.BlViXceNsbkgpskUJBrU5Or-UK8YhIN4SOYXBflPW12'; 

  it('should call next() for authorized requests', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.message).toBe('Authenticated');
  });

  it('should return 403 for unauthorized requests', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(403)
      .expect('Content-Type', /json/);

    expect(res.body.message).toBe('Пользователь не авторизован');
  });
});
