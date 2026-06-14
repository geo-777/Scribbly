import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServiceService } from './auth.service/auth.service.service';
import { AuthServiceService } from './auth.service.service';
import { AuthService } from './providers/auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthServiceService, AuthService]
})
export class AuthModule {}
