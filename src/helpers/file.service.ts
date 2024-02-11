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
          reject(err);
        } else {
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
    res.set({
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Type': 'application/octet-stream',
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    const filePath = join(directoryPath, filename);
    await this.createFileFromData(filePath, data);
    const file = await createReadStream(filePath);
    file.pipe(res);
    await new Promise((resolve) => {
      file.on('end', resolve);
    });
    await this.deleteFile(filePath);
    return new StreamableFile(file);
  }

  async streamAndDeleteFileWithoutData(
    filePath: string,
    filename: string,
    res: Response,
  ): Promise<StreamableFile> {
    res.set({
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Type': 'application/octet-stream',
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
    await new Promise((resolve) => {
      fileStream.on('end', resolve);
    });
    await this.deleteFile(filePath);
    return new StreamableFile(fileStream);
  }
}
