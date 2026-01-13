import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  duration?: number;
  size: number;
  format: string;
}

/**
 * Upload un fichier audio vers Cloudinary
 */
export async function uploadAudio(
  buffer: Buffer,
  filename: string,
  sessionId: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // Cloudinary traite l'audio comme vidéo
        folder: `trustcoach/sessions/${sessionId}`,
        public_id: filename.replace(/\.[^/.]+$/, ""), // Sans extension
        format: "mp3", // Convertir en MP3 pour optimiser
      },
      (error, result) => {
        if (error) {
          console.error("[UPLOAD_ERROR]", error);
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("No result from Cloudinary"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
          size: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload une image vers Cloudinary
 */
export async function uploadImage(
  buffer: Buffer,
  filename: string,
  folder: string = "trustcoach/images"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: filename.replace(/\.[^/.]+$/, ""),
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("[UPLOAD_ERROR]", error);
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("No result from Cloudinary"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Supprime un fichier de Cloudinary
 */
export async function deleteFile(publicId: string, resourceType: "video" | "image" = "video"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Génère une URL signée pour un téléchargement temporaire
 */
export function getSignedUrl(publicId: string, expiresIn: number = 3600): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    type: "authenticated",
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  });
}
