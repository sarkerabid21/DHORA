import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env';

class CloudinaryService {
  private configured: boolean = false;

  constructor() {
    if (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
        api_key: ENV.CLOUDINARY_API_KEY,
        api_secret: ENV.CLOUDINARY_API_SECRET,
        secure: true,
      });
      this.configured = true;
      console.log('☁️ Cloudinary initialized successfully for cloud:', ENV.CLOUDINARY_CLOUD_NAME);
    } else {
      console.warn('⚠️ Cloudinary credentials missing in .env');
    }
  }

  public isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Upload base64 image or remote URL directly to Cloudinary
   */
  public async uploadImage(
    fileBase64OrUrl: string,
    folder: string = 'dhora/wardrobe'
  ): Promise<{ url: string; secureUrl: string; publicId: string } | null> {
    if (!this.configured) {
      return null;
    }

    try {
      // Ensure proper base64 data prefix if raw base64 is provided
      let uploadTarget = fileBase64OrUrl;
      if (!uploadTarget.startsWith('http') && !uploadTarget.startsWith('data:image')) {
        uploadTarget = `data:image/jpeg;base64,${uploadTarget}`;
      }

      const result = await cloudinary.uploader.upload(uploadTarget, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      });

      return {
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      console.error('[Cloudinary Upload Error]:', error?.message || error);
      return null;
    }
  }

  /**
   * Upload raw buffer (e.g. from Sharp background-cleaned transparent PNG)
   */
  public async uploadBuffer(
    buffer: Buffer,
    folder: string = 'dhora/wardrobe_cutouts',
    format: string = 'png'
  ): Promise<{ url: string; secureUrl: string; publicId: string } | null> {
    if (!this.configured) {
      return null;
    }

    try {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            format,
          },
          (error, result) => {
            if (error || !result) {
              console.error('[Cloudinary Buffer Upload Error]:', error?.message || error);
              resolve(null);
            } else {
              resolve({
                url: result.url,
                secureUrl: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        );

        uploadStream.end(buffer);
      });
    } catch (error: any) {
      console.error('[Cloudinary Stream Upload Error]:', error?.message || error);
      return null;
    }
  }
}

export const cloudinaryService = new CloudinaryService();
