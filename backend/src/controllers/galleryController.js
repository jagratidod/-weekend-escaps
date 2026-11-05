import GalleryPage from '../models/GalleryPage.js';

/**
 * @desc    Get Gallery Page configuration and media
 * @route   GET /api/gallery
 * @access  Public
 */
export const getGalleryPage = async (req, res, next) => {
  try {
    let gallery = await GalleryPage.findOne({ slug: 'gallery_main' });

    if (!gallery) {
      gallery = await GalleryPage.create({ slug: 'gallery_main' });
    }

    res.status(200).json({
      success: true,
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Gallery Page configuration and media
 * @route   PUT /api/gallery
 * @access  Protected (Admin only)
 */
export const updateGalleryPage = async (req, res, next) => {
  try {
    const updatePayload = { ...req.body };
    if (req.admin) {
      updatePayload.updatedBy = req.admin._id;
    }

    // Upsert the main gallery document
    const gallery = await GalleryPage.findOneAndUpdate(
      { slug: 'gallery_main' },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: 'Gallery page updated successfully',
      data: gallery,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Gallery Page configuration to original defaults
 * @route   POST /api/gallery/reset
 * @access  Protected (Admin only)
 */
export const resetGalleryPage = async (req, res, next) => {
  try {
    await GalleryPage.deleteOne({ slug: 'gallery_main' });
    const freshGallery = await GalleryPage.create({ slug: 'gallery_main' });

    res.status(200).json({
      success: true,
      message: 'Gallery page reset to default settings successfully',
      data: freshGallery,
    });
  } catch (error) {
    next(error);
  }
};
