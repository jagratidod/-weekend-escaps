import imageMap from '../data/cloudinaryImageMap.json';

/**
 * Resolves an image path to its Cloudinary CDN URL if migrated,
 * or keeps the original URL / local path as fallback.
 * @param {string} src - Image source path or URL
 * @returns {string} Cloudinary CDN URL or original path
 */
export const getImageUrl = (src) => {
  if (!src) return '';
  // If already a full URL (Cloudinary, S3, external)
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  // If present in Cloudinary migration map
  if (imageMap && imageMap[src]) {
    return imageMap[src];
  }
  return src;
};

export default getImageUrl;
