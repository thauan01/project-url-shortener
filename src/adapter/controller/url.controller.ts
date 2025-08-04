import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { CreateUrlDto, UrlResponseDto } from '../../domain/dto/url.dto';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';
import { UrlService } from '../../domain/service/url.service';
import { CurrentUser, OptionalUser } from '../decorator/user.decorator';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guard/optional-jwt-auth.guard';

@Controller()
export class UrlController {
  private readonly logger = new Logger(UrlController.name);

  constructor(private readonly urlService: UrlService) {}

  /**
   * Encurta uma URL - PÚBLICO
   * Qualquer um pode usar, mas se autenticado (JWT token), associa ao usuário
   * POST /shorten
   */
  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(OptionalJwtAuthGuard)
  async shortenUrl(
    @Body() createUrlDto: CreateUrlDto,
    @OptionalUser() user?: any
  ): Promise<UrlResponseDto> {
    const userId = user?.userId || null;
    this.logger.log(`Processing request to shorten URL: ${createUrlDto.originalUrl}${userId ? ` for user: ${userId}` : ' (anonymous)'}`);
    const result = await this.urlService.shortenUrl(createUrlDto, userId);
    this.logger.log(`Successfully shortened URL with code: ${result.shortCode}`);
    return result;
  }

  /**
   * Lista URLs - pode filtrar por usuário via query param
   * GET /urls?userId=123 (opcional)
   */
  @Get('urls')
  async getAllUrls(@Query('userId') userId?: string): Promise<UrlResponseDto[]> {
    // Converter string vazia ou undefined para null
    const validUserId = userId && userId.trim() !== '' ? userId : null;
    this.logger.log(`Processing request to get URLs${validUserId ? ` for user: ${validUserId}` : ' (all)'}`);
    const result = await this.urlService.getAllUrls(validUserId);
    this.logger.log(`Retrieved ${result.length} URLs`);
    return result;
  }

  /**
   * Lista as URLs do usuário autenticado - REQUER AUTENTICAÇÃO
   * GET /my-urls
   */
  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  async getMyUrls(@CurrentUser() user: AuthenticatedUser): Promise<UrlResponseDto[]> {
    this.logger.log(`Processing request to get URLs for authenticated user: ${user.userId}`);
    const result = await this.urlService.getUserUrls(user.userId);
    this.logger.log(`Retrieved ${result.length} URLs for user: ${user.userId}`);
    return result;
  }

  /**
   * Redireciona para a URL original
   * GET /:shortCode
   */
  @Get(':shortCode')
  async redirectToOriginal(
    @Param('shortCode') shortCode: string,
    @Res() res: Response
  ): Promise<void> {
    this.logger.log(`Processing redirect request for short code: ${shortCode}`);
    
    try {
      const originalUrl = await this.urlService.getOriginalUrl(shortCode);
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
