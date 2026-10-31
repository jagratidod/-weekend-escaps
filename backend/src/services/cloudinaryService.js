import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

/**
 * Upload a memory buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Cloudinary upload options (folder, public_id, transformation, etc.)
 * @returns {Promise<Object>} Cloudinary upload result containing secure_url, public_id, etc.
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured in .env'));
    }

    const defaultOptions = {
      folder: 'weekend_escapes',
      resource_type: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Stream Error]', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload a file from local disk to Cloudinary (used for migration scripts)
 * @param {string} localFilePath - Path to local file
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>}
 */
export const uploadLocalFileToCloudinary = async (localFilePath, options = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured in .env');
  }

  const defaultOptions = {
    folder: 'weekend_escapes',
    resource_type: 'auto',
    ...options,
  };

  return await cloudinary.uploader.upload(localFilePath, defaultOptions);
};

/**
 * Delete a media asset from Cloudinary by its public ID
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Optional options
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (publicId, options = {}) => {
  if (!isCloudinaryConfigured() || !publicId) return;
  return await cloudinary.uploader.destroy(publicId, options);
};
