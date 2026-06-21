import { Module } from '@nestjs/common';
import { TrashController } from './trash.controller';
import { TrashService } from './providers/trash.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../notes/note.entity';

@Module({
  controllers: [TrashController],
  providers: [TrashService],
  imports: [TypeOrmModule.forFeature([Note])],
})
export class TrashModule {}
