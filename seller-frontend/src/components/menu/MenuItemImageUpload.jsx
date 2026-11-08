// =============================================
// MenuItemImageUpload Component - FreeFire Hotel
// =============================================
// Handles file selection, validation, preview, upload to
// Cloudinary (via Seller Backend), and image removal.
// Never talks to Cloudinary directly.

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ImagePlus,
  Trash2,
  RefreshCw,
  FileImage,
} from 'lucide-react';
import { uploadMenuItemImage } from '../../services/api';

// ========== CONFIG ==========
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Format file size in human-readable form.
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Validate a file before upload.
 * @returns {string|null} Error message, or null if valid.
 */
function validateFile(file) {
  if (!file) return 'No file selected.';

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported format: ${file.type || 'unknown'}. Allowed: JPG, PNG, WEBP.`;
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.`;
  }

  // Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (${formatFileSize(file.size)}). Maximum: ${MAX_FILE_SIZE_MB} MB.`;
  }

  return null;
}

/**
 * MenuItemImageUpload Component
 *
 * Props:
 * - existingImage: { url, publicId } — current saved image (edit mode)
 * - onImageChange: (imageData) => void — called when upload succeeds or image removed
 *     imageData = { url, publicId } | null
 * - disabled: boolean — disable interactions while parent form is saving
 */
export default function MenuItemImageUpload({
  existingImage = null,
  onImageChange,
  onUploadStatusChange,
  disabled = false,
}) {
  // ========== STATE ==========
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(existingImage);
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Sync existingImage prop changes (e.g. when editing item loads)
  useEffect(() => {
    if (existingImage?.url) {
      setUploadedImage(existingImage);
    }
  }, [existingImage]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  // ========== HANDLERS ==========

  const clearError = () => {
    setErrorMessage('');
    setUploadState('idle');
  };

  const uploadFile = useCallback(async (file, previewUrl) => {
    setUploadState('uploading');
    setErrorMessage('');
    onUploadStatusChange?.({ isPending: true, isUploading: true });

    try {
      const imageData = await uploadMenuItemImage(file);
      setUploadedImage(imageData);
      setSelectedFile(null);
      setUploadState('success');
      onImageChange?.(imageData);
      onUploadStatusChange?.({ isPending: false, isUploading: false });

      setTimeout(() => {
        URL.revokeObjectURL(previewUrl);
        setLocalPreviewUrl((currentUrl) => currentUrl === previewUrl ? null : currentUrl);
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState('error');
      setErrorMessage(error.message || 'Upload failed. Please choose the image again to retry.');
      onUploadStatusChange?.({ isPending: true, isUploading: false });
    }
  }, [onImageChange, onUploadStatusChange]);

  const handleFileSelect = useCallback(
    (file) => {
      if (uploadState === 'uploading' || disabled) return;
      clearError();

      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setUploadState('error');
        return;
      }

      // Revoke previous preview URL
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      // Create local preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setLocalPreviewUrl(previewUrl);
      onUploadStatusChange?.({ isPending: true, isUploading: true });
      uploadFile(file, previewUrl);
    },
    [disabled, localPreviewUrl, onUploadStatusChange, uploadFile, uploadState]
  );

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input value so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  // ========== DRAG & DROP ==========
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ========== REMOVE ==========
  const handleRemoveImage = () => {
    // Clear selected file
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setUploadedImage(null);
    setUploadState('idle');
    setErrorMessage('');
    onUploadStatusChange?.({ isPending: false, isUploading: false });

    // Notify parent that image was removed
    onImageChange?.(null);
  };

  const handleCancelSelection = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setSelectedFile(null);
    setLocalPreviewUrl(null);
    setUploadState('idle');
    setErrorMessage('');
    onUploadStatusChange?.({ isPending: false, isUploading: false });
  };

  // ========== DISPLAY LOGIC ==========
  const displayImageUrl = localPreviewUrl || uploadedImage?.url || null;
  const hasUploadedImage = uploadedImage?.url && !localPreviewUrl;
  const hasSelectedFile = !!selectedFile && !!localPreviewUrl;
  const isUploading = uploadState === 'uploading';

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Food Image
      </label>

      {/* ========== DROP ZONE / PREVIEW ========== */}
      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
          isDragOver
            ? 'ring-2 ring-primary-400 ring-offset-2 bg-primary-50'
            : displayImageUrl
            ? 'bg-gray-50'
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {displayImageUrl ? (
          /* ---- IMAGE PREVIEW ---- */
          <div className="relative group">
            <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={displayImageUrl}
                alt="Food item preview"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isUploading ? 'opacity-50 blur-[1px]' : ''
                }`}
              />

              {/* Upload overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 rounded-2xl backdrop-blur-[2px]">
                  <RefreshCw size={28} className="text-white animate-spin" />
                  <span className="text-white text-sm font-semibold">
                    Uploading...
                  </span>
                </div>
              )}

              {/* Success overlay (brief flash) */}
              {uploadState === 'success' && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-2xl animate-fade-in">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                </div>
              )}

              {/* Saved badge */}
              {hasUploadedImage && uploadState !== 'success' && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  <CheckCircle size={10} />
                  Uploaded
                </div>
              )}

              {/* New file badge */}
              {hasSelectedFile && uploadState !== 'uploading' && uploadState !== 'success' && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                  <ImagePlus size={10} />
                  New image selected
                </div>
              )}

              {/* Remove / change buttons */}
              {!isUploading && !disabled && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center shadow-md transition-all backdrop-blur-sm"
                    title="Change image"
                  >
                    <ImagePlus size={14} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={hasSelectedFile ? handleCancelSelection : handleRemoveImage}
                    className="w-8 h-8 bg-white/90 hover:bg-red-50 rounded-lg flex items-center justify-center shadow-md transition-all backdrop-blur-sm"
                    title={hasSelectedFile ? 'Cancel selection' : 'Remove image'}
                  >
                    {hasSelectedFile ? (
                      <X size={14} className="text-gray-600" />
                    ) : (
                      <Trash2 size={14} className="text-red-500" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ---- EMPTY DROP ZONE ---- */
          <label
            className={`upload-placeholder h-44 rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${isDragOver ? 'border-primary-400 bg-primary-50 scale-[1.01]' : ''}`}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <Upload size={24} className="text-primary-500" />
            </div>
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">
                {isDragOver ? 'Drop your image here' : 'Choose food image'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPG, PNG or WEBP · Max {MAX_FILE_SIZE_MB} MB · Uploads automatically
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled || isUploading}
            />
          </label>
        )}

        {/* Hidden file input (for when image preview is shown) */}
        {displayImageUrl && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
        )}
      </div>

      {/* ========== FILE INFO ========== */}
      {hasSelectedFile && uploadState !== 'success' && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileImage size={16} className="text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">
              {selectedFile.name}
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {isUploading && <span className="text-xs font-semibold text-primary-600">Uploading…</span>}
        </div>
      )}

      {/* ========== SUCCESS MESSAGE ========== */}
      {uploadState === 'success' && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-green-700">
            Uploaded to Cloudinary. Save the menu item to store its URL in MongoDB.
          </p>
        </div>
      )}

      {/* ========== ERROR MESSAGE ========== */}
      {uploadState === 'error' && errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-red-700">{errorMessage}</p>
            <button
              type="button"
              onClick={() => selectedFile && localPreviewUrl
                ? uploadFile(selectedFile, localPreviewUrl)
                : clearError()}
              className="text-[10px] font-semibold text-red-500 hover:text-red-700 mt-1 underline"
            >
              {selectedFile ? 'Retry upload' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}

      {/* ========== REMOVE IMAGE BUTTON (Edit mode) ========== */}
      {hasUploadedImage && !hasSelectedFile && !isUploading && !disabled && (
        <button
          type="button"
          onClick={handleRemoveImage}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
        >
          <Trash2 size={12} />
          Remove image
        </button>
      )}
    </div>
  );
}
