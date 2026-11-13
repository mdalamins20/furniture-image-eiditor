/**
 * Cloudinary Direct Unsigned Upload Service
 * 100% Free Tier (25 GB free monthly bandwidth & storage, No Credit Card needed)
 */

const DEFAULT_CLOUD_NAME = 'hazzacg8';
const DEFAULT_UPLOAD_PRESET = 'furniture image upload';

export const isCloudinaryConfigured = Boolean(
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME) && 
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || DEFAULT_UPLOAD_PRESET)
);

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME).trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || DEFAULT_UPLOAD_PRESET).trim();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary Cloud Name বা Upload Preset সেট করা নেই');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s strict timeout so it never hangs

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url as string;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

