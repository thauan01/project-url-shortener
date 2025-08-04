import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Url } from '../entity/url.entity';
import { CreateUrlDto, UrlResponseDto } from '../dto/url.dto';
import { UserService } from './user.service';
import { UrlRepository } from '../../adapter/repository/url.repository';

@Injectable()
export class UrlService implements OnModuleInit {
  private readonly logger = new Logger(UrlService.name);
  private urls: Url[] = [];
  private readonly baseUrl = 'http://localhost:3000'; // Configure conforme necessário

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly urlRepository: UrlRepository,
  ) {}

  /**
   * Inicializa o service carregando todas as URLs do banco de dados
   */
  async onModuleInit() {
    this.logger.log('Initializing UrlService - loading URLs from database');
    try {
      this.urls = await this.urlRepository.findAll();
      this.logger.log(`Loaded ${this.urls.length} URLs from database`);
    } catch (error) {
      this.logger.error('Failed to load URLs from database', error);
      throw error;
    }
  }

  /**
   * Encurta uma URL gerando um código único de 6 caracteres
   * Se userId for fornecido, associa a URL ao usuário
   */
  async shortenUrl(createUrlDto: CreateUrlDto, userId?: string): Promise<UrlResponseDto> {
    this.logger.log(`Starting to shorten URL: ${createUrlDto.originalUrl}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    
    this.validateRequisition(createUrlDto);    

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
    const urlData = {
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      accessCount: 0,
      userId,
    };

    try {
      // Salvar no banco de dados
      const savedUrl = await this.urlRepository.create(urlData);
      
      // Adicionar à lista em memória
      this.urls.push(savedUrl);
      
      this.logger.log(`Successfully shortened URL with code: ${shortCode}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
      return this.toResponseDto(savedUrl);
    } catch (error) {
      this.logger.error('Failed to save URL to database', error);
      throw new ConflictException('Failed to create shortened URL');
    }
  }

  /**
   * Redireciona para a URL original usando o código curto
   */
  async getOriginalUrl(shortCode: string): Promise<string> {
    this.logger.log(`Looking for URL with short code: ${shortCode}`);
    
    const url = this.urls.find(u => u.shortCode === shortCode);
    
    if (!url) {
      this.logger.error(`Short code ${shortCode} not found`);
      throw new NotFoundException(`Short code ${shortCode} not found`);
    }

    try {
      // Incrementar contador de acesso no banco de dados
      await this.urlRepository.incrementAccessCount(url.id);
      
      // Atualizar também na memória
      url.accessCount++;
      
      this.logger.log(`Redirecting to: ${url.originalUrl}`);
      return url.originalUrl;
    } catch (error) {
      this.logger.error('Failed to increment access count', error);
      // Mesmo se falhar o incremento, retorna a URL original
      return url.originalUrl;
    }
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
   * Gera um novo código curto (útil para regenerar)
   */
  generateShortCode(length: number = 6): string {
    return nanoid(length);
  }

  private validateRequisition(createUrlDto: CreateUrlDto, userId?: string): void {
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

    const existingUrl = this.urls.find(u => 
      u.originalUrl === createUrlDto.originalUrl
    );
    
    if (existingUrl) {
      this.logger.log(`URL already exists with short code: ${existingUrl.shortCode}`);
      return;
    }
  }
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
