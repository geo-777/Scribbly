import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { AuthService } from './providers/auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { UserModule } from '../user/user.module';
import { GenerateTokensProvider } from './providers/generate-tokens.provider';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './guards/access-token.guard';

@Module({
  imports: [
    UserModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HashingProvider,
    GenerateTokensProvider,
    { provide: APP_GUARD, useClass: AccessTokenGuard },
  ],
  exports: [HashingProvider],
})
export class AuthModule {}
