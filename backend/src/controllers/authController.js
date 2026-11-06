import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Admin from '../models/Admin.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'weekend_escapes_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[AdminLogin Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/admin/forgot-password
// @access  Public
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered admin email address',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found with that email address',
      });
    }

    // Get reset token
    const resetToken = admin.getResetPasswordToken();
    await admin.save({ validateBeforeSave: false });

    // In a production environment, send email with reset link.
    // Also return the resetUrl / token in dev response so the user can test easily without SMTP credentials configured!
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/admin/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link generated successfully',
      resetToken,
      resetUrl,
    });
  } catch (error) {
    console.error('[ForgotPassword Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Could not process password reset',
    });
  }
};

// @desc    Reset Password with Token
// @route   POST /api/auth/admin/reset-password/:token
// @access  Public
export const adminResetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash the token from the URL params to match DB record
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const admin = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Set new password
    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;
    await admin.save();

    const authToken = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      token: authToken,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[ResetPassword Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during password reset',
    });
  }
};

// @desc    Get Current Authenticated Admin
// @route   GET /api/auth/admin/me
// @access  Protected
export const getAdminMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Change Admin Password (Logged-in admin)
// @route   PUT /api/auth/admin/change-password
// @access  Protected
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Get admin with password hash
    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found',
      });
    }

    // Verify current password
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect. Please enter your existing password correctly.',
      });
    }

    // Update password (pre('save') hook will automatically hash it with bcrypt)
    admin.password = newPassword;
    await admin.save();

    // Generate fresh auth token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Admin password changed successfully! Your account is now secured with the new password.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[ChangeAdminPassword Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating password',
    });
  }
};
