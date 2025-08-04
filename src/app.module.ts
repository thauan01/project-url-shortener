import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './adapter/controller/user.controller';
import { UrlController } from './adapter/controller/url.controller';
import { UserService } from './domain/service/user.service';
import { UrlService } from './domain/service/url.service';
import { JwtStrategy } from './adapter/strategy/jwt.strategy';
import { User } from './domain/entity/user.entity';
import { Url } from './domain/entity/url.entity';
import { UserRepository } from './adapter/repository/user.repository';
import { UrlRepository } from './adapter/repository/url.repository';
import { environmentConfig } from './configs/environment.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: environmentConfig.postgresHost,
      port: Number(environmentConfig.postgresPort),
      username: environmentConfig.postgresUser,
      password: environmentConfig.postgresPassword,
      database: environmentConfig.postgresDb,
      entities: [User, Url],
      synchronize: environmentConfig.nodeEnv !== 'production',
      logging: environmentConfig.nodeEnv === 'development',
    }),
    TypeOrmModule.forFeature([User, Url]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Em produção, use variável de ambiente
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UserController, UrlController],
  providers: [UserService, UrlService, JwtStrategy, UserRepository, UrlRepository],
})
export class AppModule {}
