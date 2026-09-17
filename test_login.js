const http = require('http');

const data = JSON.stringify({
  email: 'test@example.com',
  password: 'password'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Login Response:', body));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
