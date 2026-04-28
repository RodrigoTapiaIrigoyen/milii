import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =============================================
// Subir imagen a Cloudinary
// =============================================
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder = 'luxprofile/profiles'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Cloudinary] Error al subir imagen:', error);
          return reject(new Error('Error al subir imagen a Cloudinary'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

// =============================================
// Eliminar imagen de Cloudinary
// =============================================
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('[Cloudinary] Error al eliminar imagen:', error);
    // No lanzamos el error — si no se puede borrar en Cloudinary no debería bloquear al usuario
  }
}

// =============================================
// Extraer publicId desde una URL de Cloudinary
// (formato: .../luxprofile/profiles/userId-timestamp)
// =============================================
export function extractPublicId(cloudinaryUrl: string): string | null {
  try {
    const url = new URL(cloudinaryUrl);
    // La ruta es: /image/upload/v.../folder/publicId.ext
    const parts = url.pathname.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Saltar 'upload' y el número de versión (empieza con 'v')
    const afterUpload = parts.slice(uploadIndex + 1).filter((p) => !p.startsWith('v'));
    // Unir sin extensión
    const withExt = afterUpload.join('/');
    return withExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}
