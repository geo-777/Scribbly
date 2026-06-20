import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './providers/notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { TagsModule } from '../tags/tags.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), TagsModule, UserModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
