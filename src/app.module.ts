import { Module } from '@nestjs/common';
import { UserController } from './adapter/controller/user.controller';
import { UrlController } from './adapter/controller/url.controller';
import { UserService } from './domain/service/user.service';
import { UrlService } from './domain/service/url.service';

@Module({
  imports: [],
  controllers: [UserController, UrlController],
  providers: [UserService, UrlService],
})
export class AppModule {}
