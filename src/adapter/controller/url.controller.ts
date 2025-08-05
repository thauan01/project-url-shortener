import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUrlDto, UrlResponseDto, UpdateUrlDto } from '../../domain/dto/url.dto';
import { AuthenticatedUser } from '../../domain/interfaces/authenticated-user.interface';
import { UrlService } from '../../domain/service/url.service';
import { CurrentUser, OptionalUser } from '../decorator/user.decorator';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guard/optional-jwt-auth.guard';

@ApiTags('urls')
@Controller()
export class UrlController {
  private readonly logger = new Logger(UrlController.name);

  constructor(private readonly urlService: UrlService) {}

  /**
   * Shorten a URL - PUBLIC
   * Anyone can use it, but if authenticated (JWT token), associates it with the user
   * POST /shorten
   */
  @ApiOperation({ summary: 'Shorten a URL' })
  @ApiResponse({ status: 201, description: 'URL successfully shortened.', type: UrlResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiBody({ type: CreateUrlDto })
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
   * List authenticated user's URLs - REQUIRES AUTHENTICATION
   * GET /my-urls
   */
  @ApiOperation({ summary: 'Get authenticated user URLs' })
  @ApiResponse({ status: 200, description: 'List of user URLs.', type: [UrlResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  async getMyUrls(@CurrentUser() user: AuthenticatedUser): Promise<UrlResponseDto[]> {
    this.logger.log(`Processing request to get URLs for authenticated user: ${user.userId}`);
    const result = await this.urlService.getUserUrls(user.userId);
    this.logger.log(`Retrieved ${result.length} URLs for user: ${user.userId}`);
    return result;
  }

  /**
   * Update a URL by short code - REQUIRES AUTHENTICATION
   * PUT /urls/:shortCode
   */
  @ApiOperation({ summary: 'Update URL by short code' })
  @ApiResponse({ status: 200, description: 'URL successfully updated.', type: UrlResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiParam({ name: 'shortCode', description: 'Short code of the URL to update' })
  @ApiBody({ type: UpdateUrlDto })
  @Put('urls/:shortCode')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateUrl(
    @Param('shortCode') shortCode: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<UrlResponseDto> {
    this.logger.log(`Processing request to update URL with short code: ${shortCode} for user: ${user.userId}`);
    const result = await this.urlService.updateUrl(shortCode, updateUrlDto, user.userId);
    this.logger.log(`Successfully updated URL with short code: ${shortCode} for user: ${user.userId}`);
    return result;
  }

  /**
   * Delete a URL by short code - REQUIRES AUTHENTICATION
   * DELETE /urls/:shortCode
   */
  @ApiOperation({ summary: 'Delete URL by short code' })
  @ApiResponse({ status: 204, description: 'URL successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'URL not found.' })
  @ApiParam({ name: 'shortCode', description: 'Short code of the URL to delete' })
  @Delete('urls/:shortCode')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteUrl(
    @Param('shortCode') shortCode: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    this.logger.log(`Processing request to delete URL with short code: ${shortCode} for user: ${user.userId}`);
    await this.urlService.deleteUrl(shortCode, user.userId);
    this.logger.log(`Successfully deleted URL with short code: ${shortCode} for user: ${user.userId}`);
  }

  /**
   * Redirect to original URL
   * GET /aBcDeF
   */
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 302, description: 'Redirect to original URL.' })
  @ApiResponse({ status: 404, description: 'Short code not found.' })
  @ApiParam({ name: 'shortCode', description: 'Short code to redirect' })
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
      this.logger.error(`Error redirecting short code ${shortCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(404).json({
        statusCode: 404,
        message: `Short code ${shortCode} not found`,
        error: 'Not Found'
      });
    }
  }
}
