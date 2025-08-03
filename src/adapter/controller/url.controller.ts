import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Logger,
  HttpCode,
  HttpStatus,
  Res,
  Query
} from '@nestjs/common';
import { Response } from 'express';
import { UrlService } from '../../domain/service/url.service';
import { CreateUrlDto, UrlResponseDto } from '../../domain/dto/url.dto';
import { OptionalUser } from '../decorator/optional-user.decorator';

@Controller()
export class UrlController {
  private readonly logger = new Logger(UrlController.name);

  constructor(private readonly urlService: UrlService) {}

  /**
   * Encurta uma URL - PÚBLICO
   * Qualquer um pode usar, mas se autenticado (x-user-id header), associa ao usuário
   * POST /shorten
   */
  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  shortenUrl(
    @Body() createUrlDto: CreateUrlDto,
    @OptionalUser() userId?: string
  ): UrlResponseDto {
    this.logger.log(`Processing request to shorten URL: ${createUrlDto.originalUrl}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    const result = this.urlService.shortenUrl(createUrlDto, userId);
    this.logger.log(`Successfully shortened URL with code: ${result.shortCode}`);
    return result;
  }

  /**
   * Lista URLs - pode filtrar por usuário via query param
   * GET /urls?userId=123 (opcional)
   */
  @Get('urls')
  getAllUrls(@Query('userId') userId?: string): UrlResponseDto[] {
    this.logger.log(`Processing request to get URLs${userId ? ` for user: ${userId}` : ' (all)'}`);
    const result = this.urlService.getAllUrls(userId);
    this.logger.log(`Retrieved ${result.length} URLs`);
    return result;
  }

  /**
   * Lista URLs de um usuário específico
   * GET /users/:userId/urls
   */
  @Get('users/:userId/urls')
  getUserUrls(@Param('userId') userId: string): UrlResponseDto[] {
    this.logger.log(`Processing request to get URLs for user: ${userId}`);
    const result = this.urlService.getUserUrls(userId);
    this.logger.log(`Retrieved ${result.length} URLs for user: ${userId}`);
    return result;
  }

  /**
   * Busca informações de uma URL pelo código curto
   * GET /info/:shortCode
   */
  @Get('info/:shortCode')
  getUrlInfo(@Param('shortCode') shortCode: string): UrlResponseDto {
    this.logger.log(`Processing request to get info for short code: ${shortCode}`);
    const result = this.urlService.getUrlByShortCode(shortCode);
    this.logger.log(`Retrieved info for short code: ${shortCode}`);
    return result;
  }

  /**
   * Redireciona para a URL original
   * GET /:shortCode
   */
  @Get(':shortCode')
  redirectToOriginal(
    @Param('shortCode') shortCode: string,
    @Res() res: Response
  ): void {
    this.logger.log(`Processing redirect request for short code: ${shortCode}`);
    
    try {
      const originalUrl = this.urlService.getOriginalUrl(shortCode);
      this.logger.log(`Redirecting ${shortCode} to ${originalUrl}`);
      res.redirect(302, originalUrl);
    } catch (error) {
      this.logger.error(`Error redirecting short code ${shortCode}: ${error.message}`);
      res.status(404).json({
        statusCode: 404,
        message: `Short code ${shortCode} not found`,
        error: 'Not Found'
      });
    }
  }
}
