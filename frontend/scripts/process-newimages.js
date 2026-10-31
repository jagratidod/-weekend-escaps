import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImages() {
  console.log('Processing new images from public/newimage...');

  // 1. Hero Image
  const heroPath = 'public/newimage/herosecction/heroimage.png';
  if (fs.existsSync(heroPath)) {
    await sharp(heroPath)
      .webp({ quality: 90 })
      .toFile('public/images/hero/hero-mountain.webp');
    console.log('Updated public/images/hero/hero-mountain.webp');
  }

  // 2. Explore / Destinations & Packages
  const destMap = [
    { src: 'public/newimage/exploresection/kedarkantha.png', dest: 'public/images/destinations/kedarkantha.webp', pkg: 'public/images/packages/kedarkantha-trek.webp', blog: 'public/images/blogs/blog-kedarkantha.webp', gal: 'public/images/gallery/gallery-1.webp' },
    { src: 'public/newimage/exploresection/kashmir.png', dest: 'public/images/destinations/kashmir.webp', pkg: 'public/images/packages/kashmir-getaway.webp', blog: 'public/images/blogs/blog-kashmir.webp', gal: 'public/images/gallery/gallery-2.webp' },
    { src: 'public/newimage/exploresection/manali.png', dest: 'public/images/destinations/manali.webp', pkg: 'public/images/packages/manali-adventure.webp', gal: 'public/images/gallery/gallery-5.webp' },
    { src: 'public/newimage/exploresection/vally.png', dest: 'public/images/destinations/spiti.webp', gal: 'public/images/gallery/gallery-4.webp' },
    { src: 'public/newimage/exploresection/bali.png', dest: 'public/images/destinations/bali.webp', pkg: 'public/images/packages/bali-escape.webp', blog: 'public/images/blogs/blog-bali.webp', gal: 'public/images/gallery/gallery-6.webp' }
  ];

  for (const item of destMap) {
    if (fs.existsSync(item.src)) {
      const buf = await sharp(item.src).webp({ quality: 88 }).toBuffer();
      fs.writeFileSync(item.dest, buf);
      if (item.pkg) fs.writeFileSync(item.pkg, buf);
      if (item.blog) fs.writeFileSync(item.blog, buf);
      if (item.gal) fs.writeFileSync(item.gal, buf);
      console.log(`Processed ${item.src} -> ${item.dest}`);
    }
  }

  // 3. Banner 1 -> Choose Your Experience background
  const banner1Path = 'public/newimage/other sections image/banner1.png';
  if (fs.existsSync(banner1Path)) {
    await sharp(banner1Path)
      .webp({ quality: 88 })
      .toFile('public/images/experiences/experience-bg.webp');
    console.log('Updated public/images/experiences/experience-bg.webp with banner1.png');
  }

  // 4. Footer Banner 2 -> Final CTA background
  const footerBannerPath = 'public/newimage/other sections image/footerbanner2.png';
  if (fs.existsSync(footerBannerPath)) {
    await sharp(footerBannerPath)
      .webp({ quality: 88 })
      .toFile('public/images/cta/cta-mountain.webp');
    console.log('Updated public/images/cta/cta-mountain.webp with footerbanner2.png');
  }

  // 5. Image 1 in other sections image -> Why Choose Weekend Escapes (More Than Just A Trip)
  const whyUsPath = 'public/newimage/other sections image/image1.png';
  if (fs.existsSync(whyUsPath)) {
    await sharp(whyUsPath)
      .webp({ quality: 88 })
      .toFile('public/images/why-us/why-us-traveler.webp');
    console.log('Updated public/images/why-us/why-us-traveler.webp with other sections image/image1.png');
  }

  // 6. Image 1 in photos -> Gallery 3 (Campfire / group / adventure memories)
  const photo1Path = 'public/newimage/photos/image1.png';
  if (fs.existsSync(photo1Path)) {
    await sharp(photo1Path)
      .webp({ quality: 88 })
      .toFile('public/images/gallery/gallery-3.webp');
    console.log('Updated public/images/gallery/gallery-3.webp with photos/image1.png');
  }

  console.log('All new images successfully processed and mapped to all website sections!');
}

processImages().catch(err => {
  console.error('Error processing images:', err);
  process.exit(1);
});
