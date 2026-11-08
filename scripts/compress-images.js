// Compress all images in public/images using sharp
// Converts PNGs to WebP, optimizes JPGs, creates compressed copies
import sharp from 'sharp';
import { readdir, stat, rename, mkdir } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = join(process.cwd(), 'public', 'images');
const BACKUP_DIR = join(process.cwd(), 'public', 'images', '_originals');

async function compressImages() {
  console.log('🖼️  Compressing images in:', IMAGES_DIR);
  
  // Create backup directory
  await mkdir(BACKUP_DIR, { recursive: true });
  
  const files = await readdir(IMAGES_DIR);
  let totalOriginal = 0;
  let totalCompressed = 0;

  for (const file of files) {
    if (file.startsWith('_') || file.startsWith('.')) continue;
    
    const filePath = join(IMAGES_DIR, file);
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) continue;
    
    const ext = file.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(ext)) continue;

    const originalSize = fileStat.size;
    totalOriginal += originalSize;

    // Backup original
    await rename(filePath, join(BACKUP_DIR, file));
    const backupPath = join(BACKUP_DIR, file);
    
    try {
      const image = sharp(backupPath);
      const metadata = await image.metadata();
      
      // Resize if extremely large (>1200px wide for UI images)
      const maxWidth = file.includes('logo') ? 200 : 800;
      const resizeOpts = metadata.width > maxWidth ? { width: maxWidth } : {};
      
      if (ext === 'png') {
        // Compress PNG with much better compression
        await sharp(backupPath)
          .resize(resizeOpts)
          .png({ quality: 80, compressionLevel: 9, effort: 10 })
          .toFile(filePath);
      } else if (ext === 'jpg' || ext === 'jpeg') {
        // Compress JPEG with quality reduction
        await sharp(backupPath)
          .resize(resizeOpts)
          .jpeg({ quality: 75, mozjpeg: true })
          .toFile(filePath);
      }

      const newStat = await stat(filePath);
      totalCompressed += newStat.size;
      
      const savings = ((1 - newStat.size / originalSize) * 100).toFixed(1);
      console.log(
        `  ✅ ${file}: ${(originalSize / 1024).toFixed(0)}KB → ${(newStat.size / 1024).toFixed(0)}KB (${savings}% smaller)`
      );
    } catch (err) {
      console.error(`  ❌ Failed to compress ${file}:`, err.message);
      // Restore original on failure
      await rename(backupPath, filePath);
    }
  }

  const totalSavings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1);
  console.log(
    `\n📊 Total: ${(totalOriginal / 1024).toFixed(0)}KB → ${(totalCompressed / 1024).toFixed(0)}KB (${totalSavings}% smaller)`
  );
  console.log('💾 Originals backed up to: public/images/_originals/');
}

compressImages().catch(console.error);
