const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1ODc4OTcyOCwiZXhwIjoxNzU5Mzk0NTI4fQ.LnpRqcjcfMNkSeBQIBslLyqe-KY3ZBIvc3NJnXKt1d0';
console.log('Decoded token:', jwt.decode(token));