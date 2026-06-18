import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

import { AuthService } from './providers/auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, HashingProvider],
  exports: [HashingProvider],
})
export class AuthModule {}
