import { Global, Injectable, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, createWriteStream, unlink } from 'fs';
import { join } from 'path';

@Global()
@Injectable()
export class FileService {
  async createFileFromData(filePath: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(filePath);

      stream.on('open', () => {
        stream.write(data);
        stream.end();
      });

      stream.on('finish', () => {
        resolve();
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      unlink(filePath, (err) => {
        if (err) {
          console.log('has error', err);
          reject(err);
        } else {
          console.log('success');
          resolve();
        }
      });
    });
  }

  async streamAndDeleteFile(
    directoryPath: string,
    filename: string,
    data: any,
    res: Response,
  ): Promise<StreamableFile> {
    const filePath = join(directoryPath, filename);
    await this.createFileFromData(filePath, data);
    const file = await createReadStream(filePath);
    await this.deleteFile(filePath);
    res.set({
      'Content-Disposition': `attachment; filename=${filename}`,
    });
    return new StreamableFile(file);
  }
}
