import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  RotateCcw,
  AlertCircle,
  Loader2,
  MessageCircle,
  ExternalLink,
  Phone,
  Save,
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Maximize2,
  Plus,
  Minus,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import { useSettings, cleanWhatsAppNumber, buildWhatsAppUrl } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function LogoManager() {
  const {
    logoUrl,
    rawLogoUrl,
    footerLogoUrl,
    rawFooterLogoUrl,
    darkLogoUrl,
    rawDarkLogoUrl,
    logoHeight,
    footerLogoHeight,
    updateLogoSize,
    resetLogoSize,
    whatsappNumber,
    whatsappMessage,
    refreshSettings,
    API_BASE_URL,
  } = useSettings();
  const { token, admin, changePassword } = useAuth();

  // Admin Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passStatusMessage, setPassStatusMessage] = useState({ type: '', text: '' });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Footer Logo state
  const [selectedFooterFile, setSelectedFooterFile] = useState(null);
  const [previewFooterUrl, setPreviewFooterUrl] = useState(null);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [footerStatusMessage, setFooterStatusMessage] = useState({ type: '', text: '' });
  const footerFileInputRef = useRef(null);

  // Dark Background / Light Logo state
  const [selectedDarkFile, setSelectedDarkFile] = useState(null);
  const [previewDarkUrl, setPreviewDarkUrl] = useState(null);
  const [uploadingDark, setUploadingDark] = useState(false);
  const [darkStatusMessage, setDarkStatusMessage] = useState({ type: '', text: '' });
  const darkFileInputRef = useRef(null);

  // WhatsApp Settings state
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [savingWa, setSavingWa] = useState(false);
  const [waStatusMessage, setWaStatusMessage] = useState({ type: '', text: '' });

  // Logo Dimensions & Display Size state
  const [headerSize, setHeaderSize] = useState(Number(logoHeight) || 48);
  const [footerSize, setFooterSize] = useState(Number(footerLogoHeight) || 48);
  const [previewBgMode, setPreviewBgMode] = useState('light'); // 'light' | 'dark'
  const [savingLogoSize, setSavingLogoSize] = useState(false);
  const [logoSizeStatusMessage, setLogoSizeStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (logoHeight !== undefined && logoHeight !== null) {
      setHeaderSize(Number(logoHeight) || 48);
    }
  }, [logoHeight]);

  useEffect(() => {
    if (footerLogoHeight !== undefined && footerLogoHeight !== null) {
      setFooterSize(Number(footerLogoHeight) || 48);
    }
  }, [footerLogoHeight]);

  const handleHeaderSizeChange = (val) => {
    const num = Math.min(160, Math.max(20, Number(val) || 20));
    setHeaderSize(num);
  };

  const handleFooterSizeChange = (val) => {
    const num = Math.min(160, Math.max(20, Number(val) || 20));
    setFooterSize(num);
  };

  const handleStepHeaderSize = (delta) => {
    setHeaderSize((prev) => Math.min(160, Math.max(20, prev + delta)));
  };

  const handleStepFooterSize = (delta) => {
    setFooterSize((prev) => Math.min(160, Math.max(20, prev + delta)));
  };

  const handleSaveLogoSizes = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      setLogoSizeStatusMessage({ type: 'error', text: 'Admin authorization token missing. Please re-login.' });
      return;
    }
    setSavingLogoSize(true);
    setLogoSizeStatusMessage({ type: '', text: '' });
    try {
      const res = await updateLogoSize(token, {
        logoHeight: headerSize,
        footerLogoHeight: footerSize,
      });
      if (res.success) {
        setLogoSizeStatusMessage({
          type: 'success',
          text: `Logo sizes updated successfully! Header Logo: ${headerSize}px, Footer Logo: ${footerSize}px. Live website updated.`,
        });
      } else {
        setLogoSizeStatusMessage({ type: 'error', text: res.message || 'Failed to update logo sizes.' });
      }
    } catch (err) {
      setLogoSizeStatusMessage({ type: 'error', text: err.message || 'Error updating logo sizes.' });
    } finally {
      setSavingLogoSize(false);
    }
  };

  const handleResetLogoSizes = async () => {
    if (!token) return;
    setSavingLogoSize(true);
    setLogoSizeStatusMessage({ type: '', text: '' });
    try {
      const res = await resetLogoSize(token);
      if (res.success) {
        setHeaderSize(48);
        setFooterSize(48);
        setLogoSizeStatusMessage({
          type: 'success',
          text: 'Logo sizes reset to default (48px) successfully!',
        });
      } else {
        setLogoSizeStatusMessage({ type: 'error', text: res.message || 'Failed to reset logo sizes.' });
      }
    } catch (err) {
      setLogoSizeStatusMessage({ type: 'error', text: err.message || 'Error resetting logo sizes.' });
    } finally {
      setSavingLogoSize(false);
    }
  };

  useEffect(() => {
    if (whatsappNumber !== undefined) {
      setWaPhone(whatsappNumber);
    }
    if (whatsappMessage !== undefined) {
      setWaMessage(whatsappMessage);
    }
  }, [whatsappNumber, whatsappMessage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setStatusMessage({ type: '', text: '' });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Please select an image file first.' });
      return;
    }

    try {
      setUploading(true);
      setStatusMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('logo', selectedFile);

      const res = await fetch(`${API_BASE_URL}/settings/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload logo');
      }

      await refreshSettings();
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setStatusMessage({
        type: 'success',
        text: 'Website logo updated successfully! All pages are now displaying the new logo.',
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error uploading logo' });
    } finally {
      setUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    try {
      setUploading(true);
      setStatusMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE_URL}/settings/logo/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset logo');
      }

      await refreshSettings();
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setStatusMessage({
        type: 'success',
        text: 'Default Weekend Escapes logo has been restored.',
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error resetting logo' });
    } finally {
      setUploading(false);
    }
  };

  // Footer Logo Handlers
  const handleFooterFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFooterStatusMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setSelectedFooterFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewFooterUrl(objectUrl);
    setFooterStatusMessage({ type: '', text: '' });
  };

  const handleFooterUpload = async () => {
    if (!selectedFooterFile) {
      setFooterStatusMessage({ type: 'error', text: 'Please select an image file for footer logo first.' });
      return;
    }

    try {
      setUploadingFooter(true);
      setFooterStatusMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('logo', selectedFooterFile);

      const res = await fetch(`${API_BASE_URL}/settings/footer-logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload footer logo');
      }

      await refreshSettings();
      setSelectedFooterFile(null);
      setPreviewFooterUrl(null);
      if (footerFileInputRef.current) footerFileInputRef.current.value = '';

      setFooterStatusMessage({
        type: 'success',
        text: 'Footer logo updated successfully! The website footer is now displaying the new logo.',
      });
    } catch (err) {
      setFooterStatusMessage({ type: 'error', text: err.message || 'Error uploading footer logo' });
    } finally {
      setUploadingFooter(false);
    }
  };

  const handleResetFooterToDefault = async () => {
    try {
      setUploadingFooter(true);
      setFooterStatusMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE_URL}/settings/footer-logo/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset footer logo');
      }

      await refreshSettings();
      setSelectedFooterFile(null);
      setPreviewFooterUrl(null);
      if (footerFileInputRef.current) footerFileInputRef.current.value = '';

      setFooterStatusMessage({
        type: 'success',
        text: 'Default Weekend Escapes footer logo has been restored.',
      });
    } catch (err) {
      setFooterStatusMessage({ type: 'error', text: err.message || 'Error resetting footer logo' });
    } finally {
      setUploadingFooter(false);
    }
  };

  // Dark Background Logo Handlers
  const handleDarkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDarkStatusMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setSelectedDarkFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewDarkUrl(objectUrl);
    setDarkStatusMessage({ type: '', text: '' });
  };

  const handleDarkUpload = async () => {
    if (!selectedDarkFile) {
      setDarkStatusMessage({ type: 'error', text: 'Please select an image file for dark background logo first.' });
      return;
    }

    try {
      setUploadingDark(true);
      setDarkStatusMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('logo', selectedDarkFile);

      const res = await fetch(`${API_BASE_URL}/settings/dark-logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload dark background logo');
      }

      await refreshSettings();
      setSelectedDarkFile(null);
      setPreviewDarkUrl(null);
      if (darkFileInputRef.current) darkFileInputRef.current.value = '';

      setDarkStatusMessage({
        type: 'success',
        text: 'Dark background logo updated successfully! Pages with dark hero backgrounds (Contact Us, About Us, etc.) and transparent headers will now display this logo clearly without background issues.',
      });
    } catch (err) {
      setDarkStatusMessage({ type: 'error', text: err.message || 'Error uploading dark background logo' });
    } finally {
      setUploadingDark(false);
    }
  };

  const handleResetDarkToDefault = async () => {
    try {
      setUploadingDark(true);
      setDarkStatusMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE_URL}/settings/dark-logo/reset`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset dark background logo');
      }

      await refreshSettings();
      setSelectedDarkFile(null);
      setPreviewDarkUrl(null);
      if (darkFileInputRef.current) darkFileInputRef.current.value = '';

      setDarkStatusMessage({
        type: 'success',
        text: 'Default Weekend Escapes dark background logo has been restored.',
      });
    } catch (err) {
      setDarkStatusMessage({ type: 'error', text: err.message || 'Error resetting dark background logo' });
    } finally {
      setUploadingDark(false);
    }
  };

  // Handle Admin Password Change
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassStatusMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassStatusMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (currentPassword === newPassword) {
      setPassStatusMessage({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPassStatusMessage({
        type: 'success',
        text: res.message || 'Admin password updated successfully! Please keep it safe.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update admin password',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveWhatsApp = async (e) => {
    if (e) e.preventDefault();
    if (!waPhone.trim()) {
      setWaStatusMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return;
    }

    try {
      setSavingWa(true);
      setWaStatusMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE_URL}/settings/whatsapp`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          whatsappNumber: waPhone.trim(),
          whatsappMessage: waMessage.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update WhatsApp settings');
      }

      await refreshSettings();
      setWaStatusMessage({
        type: 'success',
        text: 'WhatsApp number updated successfully! Clicking the WhatsApp icon on the live website will now open chat with this number.',
      });
    } catch (err) {
      console.error('Save WhatsApp error:', err);
      setWaStatusMessage({ type: 'error', text: err.message || 'Error updating WhatsApp number' });
    } finally {
      setSavingWa(false);
    }
  };

  const handleResetWhatsApp = () => {
    setWaPhone('+91 98765 43210');
    setWaMessage('Hi Weekend Escapes! I would like to plan my next adventure.');
    setWaStatusMessage({
      type: 'success',
      text: 'Default WhatsApp number loaded. Click "Save WhatsApp Settings" to apply.',
    });
  };

  const currentWaUrl = buildWhatsAppUrl(waPhone, waMessage);
  const formattedDigits = cleanWhatsAppNumber(waPhone);

  return (
    <div className="space-y-8 select-none">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF6B16]"></span>
            <span className="text-[#FF6B16] font-bold text-xs uppercase tracking-wider">
              Branding & Identity
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
            Website Logo Management
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Change the primary logo that appears across the navigation header, mobile menu, and footer.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore Default Logo
        </button>
      </div>

      {/* Status Alert */}
      {statusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Current vs New Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left Column: Current Live Logo Display */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Current Active Logo
            </label>
            <a
              href="#logo-size-section"
              className="text-[11px] font-bold text-[#FF6B16] hover:underline flex items-center gap-1"
            >
              <span>Height: {headerSize}px</span>
              <Sliders className="w-3 h-3" />
            </a>
          </div>

          <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center min-h-[190px] relative group">
            <img
              src={logoUrl}
              alt="Current Logo"
              style={{ height: `${headerSize}px` }}
              className="w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-400 truncate max-w-[240px]">
              {rawLogoUrl}
            </span>
            <span className="absolute bottom-3 right-4 text-[10px] font-mono text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded">
              {headerSize}px
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-100/70 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-700">Recommended Specifications:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-neutral-500">
              <li>Format: <strong>SVG</strong> (preferred), <strong>PNG</strong> (transparent bg), WebP</li>
              <li>Dimensions: <strong>240 × 60 px</strong> or horizontal aspect ratio</li>
              <li>Maximum file size: <strong>5MB</strong></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Upload New Logo Box */}
        <div className="lg:col-span-7 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Upload New Logo
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 hover:border-[#FF6B16] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-[#FF6B16]/5 transition-all min-h-[190px] group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-xl bg-white border border-neutral-200 shadow-sm mb-3">
                  <img
                    src={previewUrl}
                    alt="New Logo Preview"
                    className="max-h-14 sm:max-h-16 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-neutral-800">{selectedFile?.name}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Click to choose a different image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-neutral-800">
                  Click or drag and drop image here
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  SVG, PNG, JPG, or WebP up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="h-12 px-6 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Logo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Save & Apply New Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════════════════
        2. DARK BACKGROUND / TRANSPARENT HEADER LOGO MANAGEMENT
        ══════════════════════════════════════════════════════════════════ */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1A384C]"></span>
            <span className="text-[#1A384C] font-bold text-xs uppercase tracking-wider">
              Dark Background & Transparent Header Contrast
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2.5">
            <span>Dark Background / Light Logo Management</span>
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Upload a light / white variant logo (with transparent background). This logo will automatically display wherever a page has a dark hero background (such as Contact Us, About Us, etc.) or transparent navigation header, ensuring crisp readability without any forced white boxes.
          </p>
        </div>

        <button
          onClick={handleResetDarkToDefault}
          disabled={uploadingDark}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore Default Dark Logo
        </button>
      </div>

      {/* Dark Logo Status Alert */}
      {darkStatusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            darkStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {darkStatusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{darkStatusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Current vs New Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left Column: Current Active Dark Background Logo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Current Dark Background Logo
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-200 border border-neutral-700">
              Dark Backdrop Preview
            </span>
          </div>

          <div className="p-8 rounded-2xl border border-neutral-800 bg-[#0B151D] flex flex-col items-center justify-center min-h-[190px] relative group shadow-inner">
            <img
              src={darkLogoUrl || logoUrl}
              alt="Current Dark Background Logo"
              className="max-h-16 sm:max-h-20 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-500 truncate max-w-[240px]">
              {rawDarkLogoUrl || rawLogoUrl}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <p className="font-semibold text-neutral-800">Where this logo appears automatically:</p>
            <ul className="list-disc pl-4 space-y-1 text-neutral-500 text-[11px]">
              <li><strong>Contact Page Hero</strong>: Header bar over mountain backdrop</li>
              <li><strong>About Page Hero</strong>: Header bar over dark expedition photo</li>
              <li><strong>Transparent Navbar Mode</strong>: Any future dark/black hero sections</li>
            </ul>
            <p className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-neutral-200">
              ✓ Transparent PNG or SVG with white/light text recommended for clean contrast.
            </p>
          </div>
        </div>

        {/* Right Column: Upload New Dark Background Logo Box */}
        <div className="lg:col-span-7 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Upload Light / Transparent Logo for Dark Backgrounds
          </label>

          <div
            onClick={() => darkFileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 hover:border-[#FF6B16] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-[#FF6B16]/5 transition-all min-h-[190px] group"
          >
            <input
              ref={darkFileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={handleDarkFileChange}
              className="hidden"
            />

            {previewDarkUrl ? (
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-xl bg-[#0B151D] border border-neutral-700 shadow-sm mb-3">
                  <img
                    src={previewDarkUrl}
                    alt="New Dark Logo Preview"
                    className="max-h-14 sm:max-h-16 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-neutral-800">{selectedDarkFile?.name}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Click to choose a different image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1A384C]/10 text-[#1A384C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-neutral-800">
                  Click or drag and drop image here
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Transparent PNG, SVG, or WebP up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleDarkUpload}
              disabled={!selectedDarkFile || uploadingDark}
              className="h-12 px-6 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingDark ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Dark Background Logo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Save & Apply Dark Background Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════════════════
        3. WEBSITE FOOTER LOGO MANAGEMENT
        ══════════════════════════════════════════════════════════════════ */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1A384C]"></span>
            <span className="text-[#1A384C] font-bold text-xs uppercase tracking-wider">
              Footer Branding & Contrast
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111]">
            Website Footer Logo Management
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Change the dedicated logo displayed on the dark website footer. Transparent PNG, SVG, or white artwork recommended.
          </p>
        </div>

        <button
          onClick={handleResetFooterToDefault}
          disabled={uploadingFooter}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore Default Footer Logo
        </button>
      </div>

      {/* Status Alert */}
      {footerStatusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            footerStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {footerStatusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{footerStatusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Current vs New Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
        {/* Left Column: Current Active Footer Logo Display */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Current Active Footer Logo
            </label>
            <a
              href="#logo-size-section"
              className="text-[11px] font-bold text-[#FF6B16] hover:underline flex items-center gap-1"
            >
              <span>Height: {footerSize}px</span>
              <Sliders className="w-3 h-3" />
            </a>
          </div>

          {/* Dark background container to accurately simulate the dark website footer */}
          <div className="p-8 rounded-2xl border border-neutral-800 bg-[#111111] flex flex-col items-center justify-center min-h-[190px] relative group shadow-inner">
            <img
              src={footerLogoUrl}
              alt="Current Footer Logo"
              style={{ height: `${footerSize}px` }}
              className={`w-auto object-contain transition-transform group-hover:scale-105 ${
                footerLogoUrl?.includes('/logo/weekend-escapes-logo.svg') ? 'invert brightness-200' : ''
              }`}
            />
            <span className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-400 truncate max-w-[240px]">
              {rawFooterLogoUrl || footerLogoUrl}
            </span>
            <span className="absolute bottom-3 right-4 text-[10px] font-mono text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
              {footerSize}px
            </span>
          </div>

          <div className="p-4 rounded-xl bg-neutral-100/70 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-700">Recommended Specifications:</p>
            <ul className="list-disc pl-4 space-y-0.5 text-neutral-500">
              <li>Format: <strong>PNG (transparent bg)</strong>, <strong>SVG</strong>, WebP</li>
              <li>Artwork: Light or white logo for high contrast on dark footer background</li>
              <li>Dimensions: <strong>240 × 60 px</strong> or horizontal aspect ratio</li>
              <li>Maximum file size: <strong>5MB</strong></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Upload New Footer Logo Box */}
        <div className="lg:col-span-7 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Upload New Footer Logo
          </label>

          <div
            onClick={() => footerFileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 hover:border-[#1A384C] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white hover:bg-neutral-50 transition-all min-h-[190px] group"
          >
            <input
              ref={footerFileInputRef}
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={handleFooterFileChange}
              className="hidden"
            />

            {previewFooterUrl ? (
              <div className="flex flex-col items-center">
                {/* Preview on dark surface so white logo is visible */}
                <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 shadow-sm mb-3">
                  <img
                    src={previewFooterUrl}
                    alt="New Footer Logo Preview"
                    className="max-h-14 sm:max-h-16 w-auto object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-neutral-800">{selectedFooterFile?.name}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Click to choose a different image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1A384C]/10 text-[#1A384C] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-neutral-800">
                  Click or drag and drop image here
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  SVG, PNG, JPG, or WebP up to 5MB
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleFooterUpload}
              disabled={!selectedFooterFile || uploadingFooter}
              className="h-12 px-6 bg-[#FF6B16] hover:bg-[#ff7d33] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 hover:shadow-[#FF6B16]/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingFooter ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Footer Logo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Save & Apply New Footer Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════════════════
        4. WEBSITE LOGO SIZE & DIMENSIONS CONTROLLER (INCREASE / DECREASE)
        ══════════════════════════════════════════════════════════════════ */}
    <div id="logo-size-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm mt-8 scroll-mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B16] animate-pulse"></span>
            <span className="font-extrabold text-xs uppercase tracking-wider text-neutral-600">
              Logo Dimensions & Scaling
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-[#FF6B16]" />
            <span>Logo Display Size (Increase / Decrease)</span>
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Website ke Header (Navbar) aur Footer logo ki size yaha se increase ya decrease karein. Live preview me real-time size dikhega.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetLogoSizes}
          disabled={savingLogoSize || (headerSize === 48 && footerSize === 48)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Default (48px)
        </button>
      </div>

      {/* Status Alert */}
      {logoSizeStatusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in duration-200 ${
            logoSizeStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {logoSizeStatusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{logoSizeStatusMessage.text}</span>
        </div>
      )}

      {/* Two Column Grid: Header Logo Size & Footer Logo Size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        
        {/* Card 1: Header / Navbar Logo Size */}
        <div className="p-6 rounded-2xl border border-neutral-200/90 bg-[#F8FAFC] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B16]/10 text-[#FF6B16] flex items-center justify-center font-bold">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#111111]">Header Navbar Logo Size</h3>
                  <p className="text-xs text-neutral-500">Website top navigation bar and mobile menu</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white border border-neutral-200 text-sm font-black text-[#FF6B16] shadow-sm">
                {headerSize} px
              </span>
            </div>

            {/* Stepper Buttons & Range Slider */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                <span>Adjust Height (20px - 140px):</span>
                <span className="text-[11px] text-neutral-400 font-mono">Current: {headerSize}px</span>
              </div>

              {/* Slider with - and + buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStepHeaderSize(-2)}
                  disabled={headerSize <= 20}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Decrease 2px"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="20"
                    max="140"
                    step="1"
                    value={headerSize}
                    onChange={(e) => handleHeaderSizeChange(e.target.value)}
                    className="w-full accent-[#FF6B16] h-2 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                    <span>20px (Compact)</span>
                    <span>48px (Default)</span>
                    <span>140px (Extra Large)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepHeaderSize(2)}
                  disabled={headerSize >= 140}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Increase 2px"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Direct Number Input */}
                <div className="w-20">
                  <div className="relative">
                    <input
                      type="number"
                      min="20"
                      max="140"
                      value={headerSize}
                      onChange={(e) => handleHeaderSizeChange(e.target.value)}
                      className="w-full pl-2.5 pr-6 py-2 text-center text-xs font-bold rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B16]/20 focus:border-[#FF6B16]"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-neutral-400 font-medium pointer-events-none">px</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Small', size: 36 },
                    { label: 'Default', size: 48 },
                    { label: 'Medium-Large', size: 60 },
                    { label: 'Large', size: 76 },
                    { label: 'Extra Large', size: 96 },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => handleHeaderSizeChange(preset.size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        headerSize === preset.size
                          ? 'bg-[#FF6B16] text-white shadow-sm'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {preset.label} ({preset.size}px)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-600">Header Live Preview:</span>
                <div className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewBgMode('light')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      previewBgMode === 'light' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Sun className="w-3 h-3 text-amber-500" /> Light Nav
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBgMode('dark')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                      previewBgMode === 'dark' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    <Moon className="w-3 h-3 text-blue-300" /> Dark Nav
                  </button>
                </div>
              </div>

              <div
                className={`p-6 rounded-2xl flex items-center justify-center min-h-[130px] border transition-colors relative overflow-hidden ${
                  previewBgMode === 'light'
                    ? 'bg-white border-neutral-200'
                    : 'bg-[#0B131A] border-neutral-800'
                }`}
              >
                <img
                  src={
                    previewBgMode === 'dark'
                      ? (previewDarkUrl || darkLogoUrl || previewUrl || logoUrl)
                      : (previewUrl || logoUrl)
                  }
                  alt="Header Logo Preview"
                  style={{ height: `${headerSize}px` }}
                  className="w-auto object-contain max-w-full transition-all duration-150 drop-shadow-sm"
                />
                <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white/80 backdrop-blur-xs">
                  {headerSize}px
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Footer Logo Size */}
        <div className="p-6 rounded-2xl border border-neutral-200/90 bg-[#F8FAFC] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#111111]">Footer Logo Size</h3>
                  <p className="text-xs text-neutral-500">Website bottom footer and Call-to-Action areas</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white border border-neutral-200 text-sm font-black text-neutral-800 shadow-sm">
                {footerSize} px
              </span>
            </div>

            {/* Stepper Buttons & Range Slider */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                <span>Adjust Height (20px - 140px):</span>
                <span className="text-[11px] text-neutral-400 font-mono">Current: {footerSize}px</span>
              </div>

              {/* Slider with - and + buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleStepFooterSize(-2)}
                  disabled={footerSize <= 20}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Decrease 2px"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="20"
                    max="140"
                    step="1"
                    value={footerSize}
                    onChange={(e) => handleFooterSizeChange(e.target.value)}
                    className="w-full accent-neutral-800 h-2 bg-neutral-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                    <span>20px (Compact)</span>
                    <span>48px (Default)</span>
                    <span>140px (Extra Large)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStepFooterSize(2)}
                  disabled={footerSize >= 140}
                  className="w-10 h-10 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Increase 2px"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Direct Number Input */}
                <div className="w-20">
                  <div className="relative">
                    <input
                      type="number"
                      min="20"
                      max="140"
                      value={footerSize}
                      onChange={(e) => handleFooterSizeChange(e.target.value)}
                      className="w-full pl-2.5 pr-6 py-2 text-center text-xs font-bold rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-700"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-neutral-400 font-medium pointer-events-none">px</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Small', size: 36 },
                    { label: 'Default', size: 48 },
                    { label: 'Medium-Large', size: 60 },
                    { label: 'Large', size: 76 },
                    { label: 'Extra Large', size: 96 },
                  ].map((preset) => (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => handleFooterSizeChange(preset.size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        footerSize === preset.size
                          ? 'bg-neutral-900 text-white shadow-sm'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {preset.label} ({preset.size}px)
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Box on Dark Footer Background */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                <span>Footer Live Preview (Dark Theme):</span>
                <span className="text-[11px] text-neutral-400 font-mono">Footer Background</span>
              </div>

              <div className="p-6 rounded-2xl flex items-center justify-center min-h-[130px] border border-neutral-800 bg-[#0B131A] relative overflow-hidden">
                <img
                  src={
                    previewFooterUrl ||
                    (footerLogoUrl && !footerLogoUrl.includes('/logo/weekend-escapes-logo.svg')
                      ? footerLogoUrl
                      : (darkLogoUrl && !darkLogoUrl.includes('/logo/weekend-escapes-logo.svg'))
                      ? darkLogoUrl
                      : footerLogoUrl || darkLogoUrl || logoUrl)
                  }
                  alt="Footer Logo Preview"
                  style={{ height: `${footerSize}px` }}
                  className={`w-auto object-contain max-w-full transition-all duration-150 ${
                    !previewFooterUrl &&
                    (!footerLogoUrl || footerLogoUrl.includes('/logo/weekend-escapes-logo.svg')) &&
                    (!darkLogoUrl || darkLogoUrl.includes('/logo/weekend-escapes-logo.svg'))
                      ? 'invert brightness-200'
                      : ''
                  }`}
                />
                <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-white/80 backdrop-blur-xs">
                  {footerSize}px
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-neutral-100">
        <div className="text-xs text-neutral-500 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <span>Logo sizes will be saved permanently in the database and applied across the entire website immediately.</span>
        </div>

        <button
          type="button"
          onClick={handleSaveLogoSizes}
          disabled={savingLogoSize || (headerSize === Number(logoHeight || 48) && footerSize === Number(footerLogoHeight || 48))}
          className="h-12 px-7 bg-[#FF6B16] hover:bg-[#e05809] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B16]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
        >
          {savingLogoSize ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Sizes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Logo Sizes</span>
            </>
          )}
        </button>
      </div>
    </div>

    {/* ══════════════════════════════════════════════════════════════════
        5. WHATSAPP FLOATING BUTTON & DIRECT CHAT SETTINGS
        ══════════════════════════════════════════════════════════════════ */}
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">
              Live Chat & Customer Contact
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2.5">
            <MessageCircle className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
            <span>WhatsApp Floating Button & Number Settings</span>
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Admin yaha apna WhatsApp number set karein. Website par floating WhatsApp icon ya chat button par click karne par isi number se WhatsApp chat open hoga.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetWhatsApp}
          disabled={savingWa}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-semibold transition-all w-fit cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Load Default Number
        </button>
      </div>

      {/* WhatsApp Status Alert */}
      {waStatusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            waStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {waStatusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{waStatusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs vs Live Preview */}
      <form onSubmit={handleSaveWhatsApp} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-7 space-y-5">
            {/* Phone Number Input */}
            <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-3">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Phone Number *</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="+91 98765 43210 or 9876543210"
                  className="w-full h-12 px-4 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all font-mono"
                />
              </div>

              <div className="text-[11px] text-neutral-500 space-y-1 bg-white p-3 rounded-xl border border-neutral-200/60">
                <p className="font-semibold text-neutral-700">Supported formats:</p>
                <p>• With country code: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-emerald-700">+91 98765 43210</code> or <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-emerald-700">919876543210</code></p>
                <p>• 10-digit Indian mobile: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-emerald-700">9876543210</code> (automatically prefixed with +91)</p>
                <p className="text-emerald-700 font-medium pt-1">
                  &rarr; Clean WhatsApp Target: <strong className="font-mono">+{formattedDigits}</strong>
                </p>
              </div>
            </div>

            {/* Default Chat Greeting Message */}
            <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-3">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Pre-filled WhatsApp Chat Message</span>
              </label>

              <textarea
                rows={3}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                placeholder="Hi Weekend Escapes! I would like to plan my next adventure."
                className="w-full p-3.5 rounded-xl border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none resize-none transition-all"
              />

              <p className="text-[11px] text-neutral-400">
                This message will automatically appear in the user's WhatsApp chat input box when they click the WhatsApp button.
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="lg:col-span-5 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
              Live WhatsApp Button Preview
            </label>

            {/* Mock Screen Preview Box */}
            <div className="p-6 rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden text-center">
              <div className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Front-end Floating Widget Mockup
              </div>

              {/* Floating Button Mockup */}
              <div className="relative group/mock my-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 ring-4 ring-emerald-500/20 animate-bounce">
                  <MessageCircle className="w-8 h-8 fill-white/20" />
                </div>
                <div className="mt-3 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-bold shadow-md">
                  Chat with an Expert
                </div>
              </div>

              <div className="mt-2 text-xs text-neutral-600 max-w-xs">
                Targeting Phone: <strong className="font-mono text-emerald-700">+{formattedDigits}</strong>
              </div>

              {/* Test WhatsApp Link Button */}
              <a
                href={currentWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Test Live Link in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Generated URL Display */}
            <div className="p-4 rounded-xl bg-white border border-neutral-200 text-xs space-y-1">
              <p className="font-bold text-neutral-700 text-[11px] uppercase tracking-wider">
                Generated wa.me Endpoint:
              </p>
              <div className="p-2 rounded bg-neutral-100 font-mono text-[11px] text-neutral-700 break-all select-all">
                {currentWaUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            disabled={savingWa}
            className="h-12 px-7 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingWa ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving WhatsApp Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save WhatsApp Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    {/* ══════════════════════════════════════════════════════════════════
        6. ADMIN ACCOUNT & PASSWORD SECURITY SETTINGS
        ══════════════════════════════════════════════════════════════════ */}
    <div id="admin-password-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-150 shadow-sm mt-8 scroll-mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">
              Admin Authentication & Access Control
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#111111] flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-blue-600" />
            <span>Admin Account & Password Security</span>
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
            Change the master password for the admin panel. Your new password must be at least 6 characters long.
          </p>
        </div>

        {/* Account Chip */}
        <div className="bg-neutral-50 px-4 py-2.5 rounded-2xl border border-neutral-200/80 flex items-center gap-3 self-start sm:self-auto">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-neutral-900">{admin?.name || 'Administrator'}</div>
            <div className="text-[11px] text-neutral-500 font-mono">{admin?.email || 'admin@weekendescapes.in'}</div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {passStatusMessage.text && (
        <div
          className={`mt-6 p-4 rounded-2xl flex items-start gap-3 text-sm ${
            passStatusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {passStatusMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{passStatusMessage.text}</span>
        </div>
      )}

      {/* Password Form */}
      <form onSubmit={handleChangePasswordSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Current Password */}
          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-neutral-500" />
              <span>Current Password *</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">Required to verify your authorization.</p>
          </div>

          {/* 2. New Password */}
          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>New Password *</span>
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter strong new password"
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-400">Min. 6 characters</span>
              {newPassword && (
                <span
                  className={`font-bold ${
                    newPassword.length >= 10
                      ? 'text-emerald-600'
                      : newPassword.length >= 6
                      ? 'text-amber-600'
                      : 'text-red-500'
                  }`}
                >
                  {newPassword.length >= 10 ? 'Strong' : newPassword.length >= 6 ? 'Good' : 'Too short'}
                </span>
              )}
            </div>
          </div>

          {/* 3. Confirm New Password */}
          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-neutral-200/80 space-y-2">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Confirm New Password *</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className={`w-full h-12 pl-4 pr-11 rounded-xl border bg-white text-sm font-medium text-neutral-900 focus:ring-2 outline-none transition-all ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-neutral-200 focus:border-blue-500 focus:ring-blue-500/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[11px]">
              {confirmPassword && confirmPassword !== newPassword ? (
                <span className="text-red-500 font-semibold">Passwords do not match</span>
              ) : confirmPassword && confirmPassword === newPassword ? (
                <span className="text-emerald-600 font-semibold">Passwords match</span>
              ) : (
                <span className="text-neutral-400">Must match new password above</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-400" />
            <span>Password changes take effect immediately across all sessions.</span>
          </div>

          <button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="h-12 px-7 bg-neutral-900 hover:bg-[#FF6B16] active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-neutral-900/10 hover:shadow-[#FF6B16]/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Admin Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>

    </div>
);
}
