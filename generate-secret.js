// Simple script to generate a secure JWT secret

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');

console.log('\n====================================');
console.log('  Generated JWT Secret');
console.log('====================================\n');
console.log(secret);
console.log('\n');
console.log('Copy this value to your .env file as JWT_SECRET');
console.log('\n');
