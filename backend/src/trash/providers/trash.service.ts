import { Injectable } from '@nestjs/common';
import { type ActiveUserData } from '../../auth/interfaces/active-user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from '../../notes/note.entity';
import { Repository } from 'typeorm';
import { Not, IsNull } from 'typeorm';

@Injectable()
export class TrashService {
  constructor(
    @InjectRepository(Note) private readonly noteRepo: Repository<Note>,
  ) {}

  public async getAllTrash(user: ActiveUserData) {
    return await this.noteRepo.find({
      withDeleted: true,
      where: {
        user: { id: user.sub },
        deletedAt: Not(IsNull()),
      },
    });
  }
}
