import { Injectable, NotFoundException } from '@nestjs/common';
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

  public async restoreTrash(id: number | null, user: ActiveUserData) {
    if (id !== null) {
      const result = await this.noteRepo.restore({
        id,
        user: {
          id: user.sub,
        },
      });
      if (result.affected === 0) {
        throw new NotFoundException('Note not found');
      }
    } else {
      await this.noteRepo.restore({
        user: {
          id: user.sub,
        },
      });
    }
    return { message: 'Restored successfully' };
  }

  public async clearTrash(id: number | null, user: ActiveUserData) {
    if (id !== null) {
      const result = await this.noteRepo.delete({
        id,
        user: {
          id: user.sub,
        },
        deletedAt: Not(IsNull()),
      });

      if (result.affected === 0) {
        throw new NotFoundException('Trashed note not found');
      }
    } else {
      await this.noteRepo.delete({
        user: {
          id: user.sub,
        },
        deletedAt: Not(IsNull()),
      });
    }
    return { message: 'Cleared successfully' };
  }
}
