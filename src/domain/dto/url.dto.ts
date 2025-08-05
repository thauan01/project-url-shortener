export class CreateUrlDto {
  originalUrl: string;
}

export class UpdateUrlDto {
  shortCode: string;
  originalUrl: string;
}

export class UrlResponseDto {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt: Date | null;
  accessCount: number;
  userId?: string;
  userName?: string;
}
