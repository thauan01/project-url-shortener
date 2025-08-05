import { Injectable, NotFoundException, ConflictException, Logger, Inject, forwardRef, OnModuleInit } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Url } from '../entity/url.entity';
import { CreateUrlDto, UrlResponseDto, UpdateUrlDto } from '../dto/url.dto';
import { UserService } from './user.service';
import { DI_URL_REPOSITORY } from '../../configs/container-names';
import { IUrlRepository } from '../interfaces/url-repository.interface';

@Injectable()
export class UrlService implements OnModuleInit {
  private readonly logger = new Logger(UrlService.name);
  private urls: Url[] = [];
  private readonly baseUrl = 'http://localhost:3000'; // Configure conforme necessário

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(DI_URL_REPOSITORY)
    private readonly urlRepository: IUrlRepository,
  ) {}

  /**
   * Inicializa o service carregando todas as URLs do banco de dados
   */
  async onModuleInit() {
    this.logger.log('Initializing UrlService - loading URLs from database');
    try {
      const allUrls = await this.urlRepository.findAll();

      this.urls = allUrls.filter(url => !url.deletedAt);
      this.logger.log(`Loaded ${allUrls.length} URLs from database, ${this.urls.length} active URLs after filtering deleted ones`);
    } catch (error) {
      this.logger.error('Failed to load URLs from database', error);
      throw error;
    }
  }

  /**
   * Encurta uma URL gerando um código único de 6 caracteres
   * Se userId for fornecido, associa a URL ao usuário
   */
  async shortenUrl(createUrlDto: CreateUrlDto, userId?: string | null): Promise<UrlResponseDto> {
    this.logger.log(`Starting to shorten URL: ${createUrlDto.originalUrl}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    
    if (!this.isValidRequisition(createUrlDto, userId)) throw new ConflictException('Invalid Requisition');

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

    // Criar nova URL encurtada - só incluir userId se não for null/undefined
    const urlData: any = {
      originalUrl: createUrlDto.originalUrl,
      shortCode,
      accessCount: 0,
    };

    // Só adicionar userId se ele existir e não for uma string vazia
    if (userId && userId.trim() !== '') {
      urlData.userId = userId;
    }

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
      await this.urlRepository.incrementAccessCountAndUpdate(url.id);
      
      // Buscar o registro atualizado do banco para sincronizar com a memória
      const updatedUrl = await this.urlRepository.findById(url.id);
      if (updatedUrl) {
        // Atualizar o registro na memória com os dados atualizados do banco
        this.updateUrlInMemoryById(updatedUrl);
      }
      
      this.logger.log(`Redirecting to: ${url.originalUrl}`);
      return url.originalUrl;
    } catch (error) {
      this.logger.error('Failed to increment access count', error);
      // Mesmo se falhar o incremento, retorna a URL original
      return url.originalUrl;
    }
  }

  /**
   * Lista URLs do usuário específico
   */
  async getUserUrls(userId: string): Promise<UrlResponseDto[]> {
    this.logger.log(`Retrieving URLs for user: ${userId}`);
    
    // Verificar se o usuário existe
    try {
      await this.userService.findById(userId);
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    const userUrls = this.urls.filter(url => url.userId === userId);
    return Promise.all(userUrls.map(url => this.toResponseDto(url)));
  }

  /**
   * Atualiza uma URL existente
   * Só permite atualizar URLs que pertencem ao usuário autenticado
   */
  async updateUrl(shortCode: string, updateUrlDto: UpdateUrlDto, userId: string): Promise<UrlResponseDto> {
    this.logger.log(`Updating URL with short code: ${shortCode} for user: ${userId}`);
    
    // Verificar se a URL existe
    const existingUrl = this.urls.find(u => u.shortCode === shortCode);
    if (!existingUrl) {
      throw new NotFoundException(`URL with short code ${shortCode} not found`);
    }

    // Verificar se a URL pertence ao usuário autenticado
    if (!existingUrl.userId || existingUrl.userId !== userId) {
      throw new NotFoundException(`URL with short code ${shortCode} not found for this user`);
    }

    // Validar nova URL se fornecida
    if (updateUrlDto.originalUrl && !this.isValidUrl(updateUrlDto.originalUrl)) {
      throw new ConflictException('Invalid URL format');
    }

    // Se está mudando o shortCode, verificar se o novo não existe
    if (updateUrlDto.shortCode && updateUrlDto.shortCode !== shortCode) {
      const existingShortCode = this.urls.find(u => u.shortCode === updateUrlDto.shortCode);
      if (existingShortCode) {
        throw new ConflictException(`Short code ${updateUrlDto.shortCode} already exists`);
      }
    }

    try {
      // Preparar dados para atualização
      const updateData: Partial<Url> = {};
      if (updateUrlDto.originalUrl) {
        updateData.originalUrl = updateUrlDto.originalUrl;
      }
      if (updateUrlDto.shortCode) {
        updateData.shortCode = updateUrlDto.shortCode;
      }

      // Atualizar no banco de dados
      const updatedUrl = await this.urlRepository.updateByShortCode(shortCode, updateData);
      
      if (!updatedUrl) {
        throw new NotFoundException(`Failed to update URL with short code ${shortCode}`);
      }

      // Atualizar na memória
      this.updateUrlInMemoryByShortCode(shortCode, updatedUrl);

      this.logger.log(`Successfully updated URL with short code: ${shortCode}`);
      const dateUpdate = new Date();
      return this.toResponseDto(updatedUrl, dateUpdate);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to update URL in database', error);
      throw new ConflictException('Failed to update URL');
    }
  }

  /**
   * Deleta uma URL existente
   * Só permite deletar URLs que pertencem ao usuário autenticado
   */
  async deleteUrl(shortCode: string, userId: string): Promise<void> {
    this.logger.log(`Deleting URL with short code: ${shortCode} for user: ${userId}`);
    
    // Verificar se a URL existe
    const existingUrl = this.urls.find(u => u.shortCode === shortCode);
    if (!existingUrl) {
      throw new NotFoundException(`URL with short code ${shortCode} not found`);
    }

    // Verificar se a URL pertence ao usuário autenticado
    if (!existingUrl.userId || existingUrl.userId !== userId) {
      throw new NotFoundException(`URL with short code ${shortCode} not found for this user`);
    }

    try {
      // Deletar do banco de dados
      await this.urlRepository.deleteByShortCode(shortCode);
      
      // Remover da lista em memória
      this.removeUrlFromMemoryByShortCode(shortCode);

      this.logger.log(`Successfully deleted URL with short code: ${shortCode}`);
    } catch (error) {
      this.logger.error('Failed to delete URL from database', error);
      throw new ConflictException('Failed to delete URL');
    }
  }

  /**
   * Gera um novo código curto (útil para regenerar)
   */
  generateShortCode(length: number = 6): string {
    return nanoid(length);
  }

  private isValidRequisition(createUrlDto: CreateUrlDto, userId?: string | null): boolean {
    if (!this.isValidUrl(createUrlDto.originalUrl)) {
      throw new ConflictException('Invalid URL format');
    }
    // Se userId for fornecido e não for vazio, verificar se o usuário existe
    if (userId && userId.trim() !== '') {
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
      return false;
    }
    return true;
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
   * Atualiza um registro na lista em memória baseado no ID
   */
  private updateUrlInMemoryById(updatedUrl: Url): void {
    const index = this.urls.findIndex(u => u.id === updatedUrl.id);
    if (index !== -1) {
      this.urls[index] = updatedUrl;
    }
  }

  /**
   * Atualiza um registro na lista em memória baseado no shortCode
   */
  private updateUrlInMemoryByShortCode(shortCode: string, updatedUrl: Url): void {
    const index = this.urls.findIndex(u => u.shortCode === shortCode);
    if (index !== -1) {
      this.urls[index] = updatedUrl;
    }
  }

  /**
   * Remove um registro da lista em memória baseado no shortCode
   */
  private removeUrlFromMemoryByShortCode(shortCode: string): void {
    const index = this.urls.findIndex(u => u.shortCode === shortCode);
    if (index !== -1) {
      this.urls.splice(index, 1);
    }
  }

  private async toResponseDto(url: Url, dateUpdate?: Date): Promise<UrlResponseDto> {
    const response: UrlResponseDto = {
      id: url.id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${this.baseUrl}/${url.shortCode}`,
      createdAt: url.createdAt,
      updatedAt: dateUpdate ? dateUpdate : undefined, // A entidade não tem updatedAt, então deixamos undefined
      deletedAt: null, // A entidade não tem soft delete, então sempre null
      accessCount: url.accessCount,
    };

    if (url.userId) {
      try {
        const user = await this.userService.findById(url.userId);
        response.userId = url.userId;
        response.userName = user.name;
      } catch (error) {
        this.logger.warn(`User ${url.userId} not found for URL ${url.id}`);
      }
    }

    return response;
  }
}
