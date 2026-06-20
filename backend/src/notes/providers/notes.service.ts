import { Injectable, NotFoundException } from '@nestjs/common';
import { TagsService } from '../../tags/providers/tags.service';
import { ActiveUserData } from '../../auth/interfaces/active-user.interface';
import { UserService } from '../../user/providers/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from '../note.entity';
import { CreateNoteDto } from '../dto/create-note.dto';
import { Repository } from 'typeorm';

@Injectable()
export class NotesService {
  constructor(
    private readonly tagsService: TagsService,
    private readonly userService: UserService,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
  ) {}

  public async createNote(dto: CreateNoteDto, activeUser: ActiveUserData) {
    const user = await this.userService.findOneUserById(activeUser.sub); // checks user exists
    const tags = await this.tagsService.findTagsByIds(
      dto.tags ?? [],
      activeUser.sub,
    );
    const note = this.noteRepo.create({
      ...dto,
      tags,
      isArchived: false,
      isFavourite: false,
      isPinned: false,
      isPublic: false,
      user,
    });
    return this.noteRepo.save(note);
  }

  public async deleteNote(id: number, active: ActiveUserData) {
    const result = await this.noteRepo.softDelete({
      id,
      user: { id: active.sub },
    });
    if (result.affected === 0) throw new NotFoundException('Note not found');

    return { message: 'Deleted Succesfully' };
  }
}
