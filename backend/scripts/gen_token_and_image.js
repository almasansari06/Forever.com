import fs from 'fs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET || 'forever_jwt_secret';
const admin = (process.env.ADMIN_EMAIL || 'admin@forever.com') + (process.env.ADMIN_PASSWORD || 'forever9211');

const token = jwt.sign(admin, secret);

// write a small png file
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIW2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64, 'base64');
fs.writeFileSync('scripts/test.jpg', buffer);

console.log(token);
