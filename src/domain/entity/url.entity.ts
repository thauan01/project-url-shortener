export class Url {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  accessCount: number;
  userId?: string; // Opcional - ID do usuário proprietário

  constructor(
    id: string,
    originalUrl: string,
    shortCode: string,
    createdAt?: Date,
    accessCount?: number,
    userId?: string,
  ) {
    this.id = id;
    this.originalUrl = originalUrl;
    this.shortCode = shortCode;
    this.createdAt = createdAt || new Date();
    this.accessCount = accessCount || 0;
    this.userId = userId;
  }
}
