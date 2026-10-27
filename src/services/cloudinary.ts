import axios from 'axios';

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@/constants/config';

type CloudinaryResponse = {
  secure_url?: string;
};

export async function uploadPhoto(uri: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Falta configurar Cloudinary para subir la fotografía.');
  }

  const form = new FormData();
  form.append(
    'file',
    { uri, name: 'lectura-medidor.jpg', type: 'image/jpeg' } as unknown as Blob,
  );
  form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await axios.post<CloudinaryResponse>(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 },
  );
  if (!response.data.secure_url) {
    throw new Error('Cloudinary no devolvió la URL segura de la fotografía.');
  }
  return response.data.secure_url;
}
