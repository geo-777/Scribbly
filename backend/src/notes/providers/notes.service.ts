import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TagsService } from '../../tags/providers/tags.service';
import { ActiveUserData } from '../../auth/interfaces/active-user.interface';
import { UserService } from '../../user/providers/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Note } from '../note.entity';
import { CreateNoteDto } from '../dto/create-note.dto';
import { Repository } from 'typeorm';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { GetNotesQueryDto } from '../dto/get-query.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly tagsService: TagsService,
    private readonly userService: UserService,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
  ) {}

  public async getNotes(user: ActiveUserData, query: GetNotesQueryDto) {
    const qb = this.noteRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.tags', 'tag')
      .where('note.userId = :userId', {
        userId: user.sub,
      });

    if (query.archived !== undefined) {
      qb.andWhere('note.isArchived = :archived', {
        archived: query.archived,
      });
    }

    if (query.pinned !== undefined) {
      qb.andWhere('note.isPinned = :pinned', {
        pinned: query.pinned,
      });
    }

    if (query.favourite !== undefined) {
      qb.andWhere('note.isFavourite = :favourite', {
        favourite: query.favourite,
      });
    }

    if (query.search) {
      qb.andWhere('(note.title ILIKE :search OR note.content ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.tag) {
      qb.andWhere('tag.name = :tag', {
        tag: query.tag,
      });
    }

    return qb.getMany();
  }

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

  public async deleteNote(id: number, activeUser: ActiveUserData) {
    const result = await this.noteRepo.softDelete({
      id,
      user: { id: activeUser.sub },
    });
    if (result.affected === 0) throw new NotFoundException('Note not found');

    return { message: 'Deleted Succesfully' };
  }

  public async updateNote(
    id: number,
    dto: UpdateNoteDto,
    activeUser: ActiveUserData,
  ) {
    const exists = await this.noteRepo.findOne({
      where: { user: { id: activeUser.sub }, id },
    });
    if (!exists) throw new NotFoundException('Note not found');

    const updatesMade = Object.fromEntries(
      Object.entries(dto).filter(
        ([key, value]) => value !== undefined && value !== exists[key],
      ),
    );
    if (Object.keys(updatesMade).length === 0) {
      throw new BadRequestException('Nothing to edit');
    }

    Object.assign(exists, updatesMade);
    return await this.noteRepo.save(exists);
  }

  public async getPublicNote(id: number) {
    const note = await this.noteRepo.findOne({ where: { id, isPublic: true } });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }
}
