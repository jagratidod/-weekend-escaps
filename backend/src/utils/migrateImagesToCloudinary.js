import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
);

if (!isConfigured) {
  console.error('\n❌ ERROR: Cloudinary credentials are not configured in backend/.env!');
  console.log('Please open backend/.env and set:');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret\n');
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PUBLIC_IMAGES_DIR = path.resolve(__dirname, '../../../frontend/public');
const OUTPUT_MAP_FILE = path.resolve(__dirname, '../../../frontend/src/data/cloudinaryImageMap.json');

// Recursively get all image files
function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

async function runMigration() {
  console.log('==============================================');
  console.log('🚀 Starting Cloudinary Bulk Image Migration');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('Source Directory:', PUBLIC_IMAGES_DIR);
  console.log('==============================================\n');

  if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
    console.error('Directory not found:', PUBLIC_IMAGES_DIR);
    process.exit(1);
  }

  const imageFiles = getFilesRecursively(PUBLIC_IMAGES_DIR);
  console.log(`Found ${imageFiles.length} images to process.\n`);

  let existingMap = {};
  if (fs.existsSync(OUTPUT_MAP_FILE)) {
    try {
      existingMap = JSON.parse(fs.readFileSync(OUTPUT_MAP_FILE, 'utf-8'));
    } catch (e) {
      existingMap = {};
    }
  }

  const urlMap = { ...existingMap };
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const filePath = imageFiles[i];
    const relativePath = path.relative(path.resolve(__dirname, '../../../frontend/public'), filePath).replace(/\\/g, '/');
    const webPath = `/${relativePath}`;

    // Subfolder in Cloudinary (e.g. weekend_escapes/packages)
    const folderRelative = path.dirname(relativePath).replace(/\\/g, '/');
    const cloudinaryFolder = `weekend_escapes/${folderRelative.replace(/^images\/?/, '')}`.replace(/\/$/, '');
    const baseName = path.parse(filePath).name;

    if (urlMap[webPath]) {
      console.log(`[${i + 1}/${imageFiles.length}] ⏭️  Already migrated: ${webPath}`);
      skipCount++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${imageFiles.length}] ⬆️  Uploading: ${webPath} -> ${cloudinaryFolder}`);
      const uploadRes = await cloudinary.uploader.upload(filePath, {
        folder: cloudinaryFolder,
        public_id: baseName,
        resource_type: 'auto',
        overwrite: false,
      });

      urlMap[webPath] = uploadRes.secure_url;
      successCount++;
      console.log(`   ✅ Success: ${uploadRes.secure_url}`);

      // Save map periodically
      fs.writeFileSync(OUTPUT_MAP_FILE, JSON.stringify(urlMap, null, 2));
    } catch (err) {
      console.error(`   ❌ Failed (${webPath}):`, err.message);
      errorCount++;
    }
  }

  // Final save
  fs.writeFileSync(OUTPUT_MAP_FILE, JSON.stringify(urlMap, null, 2));

  console.log('\n==============================================');
  console.log('🎉 Migration Completed!');
  console.log(`Uploaded: ${successCount}`);
  console.log(`Skipped (already in map): ${skipCount}`);
  console.log(`Failed: ${errorCount}`);
  console.log(`Mapping saved to: ${OUTPUT_MAP_FILE}`);
  console.log('==============================================\n');
}

runMigration().catch((err) => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
