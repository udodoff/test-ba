import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as EasyYandexS3 from 'easy-yandex-s3';

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  private s3 = new EasyYandexS3.default({
    auth: {
      accessKeyId: this.configService.get<string>('YANDEX_KEY_ID'),
      secretAccessKey: this.configService.get<string>('YANDEX_SECRET_ACCESS_KEY'),
    },
    Bucket: this.configService.get<string>('YANDEX_BUCKET_NAME'),
    debug: false,
  });

  async uploadImage(file: string) {
    const fileBuffer = Buffer.from(file, 'base64');

    return await this.s3.Upload({ buffer: fileBuffer }, '/images/');
  }

  async deleteImage(url: string) {
    return await this.s3.Remove(url);
  }
}
