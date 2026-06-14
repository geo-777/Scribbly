import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './providers/notes.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
