import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Url } from '../entity/url.entity';
import { CreateUrlDto, UrlResponseDto } from '../dto/url.dto';
import { UserService } from './user.service';

@Injectable()
export class UrlService {
  private readonly logger = new Logger(UrlService.name);
  private urls: Url[] = [];
  private currentId = 1;
  private readonly baseUrl = 'http://localhost:3000'; // Configure conforme necessário

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  /**
   * Encurta uma URL gerando um código único de 6 caracteres
   * Se userId for fornecido, associa a URL ao usuário
   */
  shortenUrl(createUrlDto: CreateUrlDto, userId?: string): UrlResponseDto {
    this.logger.log(`Starting to shorten URL: ${createUrlDto.originalUrl}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    
    // Validar se a URL é válida
    if (!this.isValidUrl(createUrlDto.originalUrl)) {
      throw new ConflictException('Invalid URL format');
    }

    // Se userId for fornecido, verificar se o usuário existe
    if (userId) {
      try {
        this.userService.findById(userId);
      } catch (error) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    }

    // Verificar se a URL já foi encurtada pelo mesmo usuário (ou anonimamente)
    const existingUrl = this.urls.find(u => 
      u.originalUrl === createUrlDto.originalUrl && 
      u.userId === userId
    );
    
    if (existingUrl) {
      this.logger.log(`URL already exists with short code: ${existingUrl.shortCode}`);
      return this.toResponseDto(existingUrl);
    }

    // Gerar código único de 6 caracteres usando nanoid
    let shortCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = nanoid(6); // Gera exatamente 6 caracteres
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new ConflictException('Unable to generate unique short code');
      }
    } while (this.urls.some(u => u.shortCode === shortCode));

    // Criar nova URL encurtada
    const newUrl = new Url(
      this.currentId.toString(),
      createUrlDto.originalUrl,
      shortCode,
      new Date(),
      0,
      userId,
    );
    
    this.urls.push(newUrl);
    this.currentId++;
    
    this.logger.log(`Successfully shortened URL with code: ${shortCode}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    return this.toResponseDto(newUrl);
  }

  /**
   * Redireciona para a URL original usando o código curto
   */
  getOriginalUrl(shortCode: string): string {
    this.logger.log(`Looking for URL with short code: ${shortCode}`);
    
    const url = this.urls.find(u => u.shortCode === shortCode);
    
    if (!url) {
      this.logger.error(`Short code ${shortCode} not found`);
      throw new NotFoundException(`Short code ${shortCode} not found`);
    }

    // Incrementar contador de acesso
    url.accessCount++;
    
    this.logger.log(`Redirecting to: ${url.originalUrl}`);
    return url.originalUrl;
  }

  /**
   * Lista todas as URLs encurtadas
   * Se userId for fornecido, filtra apenas as URLs do usuário
   */
  getAllUrls(userId?: string): UrlResponseDto[] {
    this.logger.log(`Retrieving URLs${userId ? ` for user: ${userId}` : ' (all)'}`);
    
    const filteredUrls = userId 
      ? this.urls.filter(url => url.userId === userId)
      : this.urls;
      
    return filteredUrls.map(url => this.toResponseDto(url));
  }

  /**
   * Lista URLs do usuário específico
   */
  getUserUrls(userId: string): UrlResponseDto[] {
    this.logger.log(`Retrieving URLs for user: ${userId}`);
    
    // Verificar se o usuário existe
    try {
      this.userService.findById(userId);
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const userUrls = this.urls.filter(url => url.userId === userId);
    return userUrls.map(url => this.toResponseDto(url));
  }

  /**
   * Busca URL por código curto
   */
  getUrlByShortCode(shortCode: string): UrlResponseDto {
    this.logger.log(`Retrieving URL with short code: ${shortCode}`);
    
    const url = this.urls.find(u => u.shortCode === shortCode);
    
    if (!url) {
      this.logger.error(`Short code ${shortCode} not found`);
      throw new NotFoundException(`Short code ${shortCode} not found`);
    }
    
    return this.toResponseDto(url);
  }

  /**
   * Gera um novo código curto (útil para regenerar)
   */
  generateShortCode(length: number = 6): string {
    return nanoid(length);
  }

  /**
   * Valida se a string é uma URL válida
   */
  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Converte entidade para DTO de resposta
   */
  private toResponseDto(url: Url): UrlResponseDto {
    const response: UrlResponseDto = {
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${this.baseUrl}/${url.shortCode}`,
      createdAt: url.createdAt,
      accessCount: url.accessCount,
    };

    // Adicionar informações do usuário se a URL pertencer a alguém
    if (url.userId) {
      try {
        const user = this.userService.findById(url.userId);
        response.userId = url.userId;
        response.userName = user.name;
      } catch (error) {
        // Se o usuário não existir mais, apenas log o erro
        this.logger.warn(`User ${url.userId} not found for URL ${url.id}`);
      }
    }

    return response;
  }
}
