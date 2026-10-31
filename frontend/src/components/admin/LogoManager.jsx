import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

export default function LogoManager() {
  const { logoUrl, rawLogoUrl, refreshSettings, API_BASE_URL } = useSettings();
  const { token } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

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

  return (
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
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
            Current Active Logo
          </label>

          <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center min-h-[190px] relative group">
            <img
              src={logoUrl}
              alt="Current Logo"
              className="max-h-16 sm:max-h-20 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-400 truncate max-w-[240px]">
              {rawLogoUrl}
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
  );
}
