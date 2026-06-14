import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [AuthModule, UserModule, NotesModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
