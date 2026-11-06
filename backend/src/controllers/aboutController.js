import AboutPage from '../models/AboutPage.js';

/**
 * @desc    Get About Page configuration and data
 * @route   GET /api/about
 * @access  Public
 */
export const getAboutPage = async (req, res, next) => {
  try {
    let about = await AboutPage.findOne({ slug: 'about_main' });

    if (!about) {
      about = await AboutPage.create({ slug: 'about_main' });
    }

    res.status(200).json({
      success: true,
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update About Page configuration and content
 * @route   PUT /api/about
 * @access  Protected (Admin only)
 */
export const updateAboutPage = async (req, res, next) => {
  try {
    const updatePayload = { ...req.body };
    if (req.admin) {
      updatePayload.updatedBy = req.admin._id;
    }

    const about = await AboutPage.findOneAndUpdate(
      { slug: 'about_main' },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: false }
    );

    res.status(200).json({
      success: true,
      message: 'About page updated successfully',
      data: about,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset About Page configuration to original defaults
 * @route   POST /api/about/reset
 * @access  Protected (Admin only)
 */
export const resetAboutPage = async (req, res, next) => {
  try {
    await AboutPage.deleteOne({ slug: 'about_main' });
    const freshAbout = await AboutPage.create({ slug: 'about_main' });

    res.status(200).json({
      success: true,
      message: 'About page reset to default settings successfully',
      data: freshAbout,
    });
  } catch (error) {
    next(error);
  }
};
