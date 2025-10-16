import axios from 'axios';

export const CLOUD_NAME = 'dfqarws5j';
export const UPLOAD_PRESET = 'campus_unsigned';

export type CloudinaryUploadResult = {
  url: string;
  deleteToken?: string;
  resourceType?: string;
  originalFilename?: string;
  format?: string;
};

export async function uploadToCloudinary(file: File, onProgress?: (progress: number) => void): Promise<CloudinaryUploadResult> {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await axios.post(endpoint, formData, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });

  const data = response.data || {};
  return {
    url: data.secure_url || data.url,
    deleteToken: data.delete_token,
    resourceType: data.resource_type,
    originalFilename: data.original_filename,
    format: data.format,
  };
}

export async function deleteFromCloudinaryByToken(deleteToken: string): Promise<void> {
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/delete_by_token`;
  const formData = new FormData();
  formData.append('token', deleteToken);
  await axios.post(endpoint, formData);
}


