/**
 * Cloudinary Direct Unsigned Upload Service
 * 100% Free Tier (25 GB free monthly bandwidth & storage, No Credit Card needed)
 */

export const isCloudinaryConfigured = Boolean(
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && 
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

const ALLOWED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const uploadToCloudinary = async (file: File): Promise<string> => {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error('শুধু JPG, PNG বা WebP ছবি আপলোড করা যাবে');
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('ছবির সাইজ ১০ MB-এর বেশি হতে পারবে না');
  }
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary Cloud Name বা Upload Preset সেট করা নেই (.env)');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url as string;
};

