export class CreateUrlDto {
  originalUrl: string;
}

export class UrlResponseDto {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: Date;
  accessCount: number;
  userId?: string; // Opcional - só aparece se pertencer a um usuário
  userName?: string; // Opcional - nome do usuário proprietário
}
