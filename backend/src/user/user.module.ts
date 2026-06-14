import { Module } from '@nestjs/common';
import { UserService } from './providers/user.service';

@Module({
  providers: [UserService],
})
export class UserModule {}
