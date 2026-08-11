import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

const run = async () => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY;

    console.log('Using cloud:', { cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret });

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    // 1x1 px transparent PNG base64
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQIW2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
    const dataUri = `data:image/png;base64,${base64}`;

    console.log('Uploading test image...');
    const result = await cloudinary.uploader.upload(dataUri, { resource_type: 'image' });
    console.log('Upload success:', result.secure_url);
  } catch (err) {
    console.error('Cloudinary upload error:', err && err.message ? err.message : err);
    if (err && err.http_code) console.error('HTTP code:', err.http_code);
    process.exit(1);
  }
};

run();
