import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder_name?: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: folder_name || 'upload',
          use_filename: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteFile(fileId: string): Promise<any> {
    await v2.uploader.destroy(fileId);
  }

  async getFile(fileId: string): Promise<any> {
    await v2.api.resource(fileId);
  }
}
