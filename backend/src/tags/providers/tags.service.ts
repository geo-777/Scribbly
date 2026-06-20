import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTagDTO } from '../dtos/create-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../tag.entity';
import { In, Repository } from 'typeorm';
import { type ActiveUserData } from '../../auth/interfaces/active-user.interface';
import { UserService } from '../../user/providers/user.service';
import { User } from '../../user/user.entity';
@Injectable()
export class TagsService {
  constructor(
    /* ----------------------------- injecting repo ----------------------------- */
    @InjectRepository(Tag) private readonly tagsRepo: Repository<Tag>,

    /* ------------------------------ usersservice ------------------------------ */
    private readonly userService: UserService,
  ) {}
  /* ------------------- helper service to check user exists ------------------ */
  private async checkUserExistsAndReturn(id: number): Promise<User> {
    const user = await this.userService.findOneUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /* ------------------------------- creates tag ------------------------------ */
  public async createTag(
    dto: CreateTagDTO,
    activeUser: ActiveUserData,
  ): Promise<Tag> {
    const user = await this.checkUserExistsAndReturn(activeUser.sub);
    //checks tag existense
    const existingTag = await this.tagsRepo.findOne({
      where: {
        name: dto.name,
        user: {
          id: activeUser.sub,
        },
      },
    });

    if (existingTag) {
      throw new ConflictException('Tag name already exists');
    }
    const tag = this.tagsRepo.create({ ...dto, user });
    return await this.tagsRepo.save(tag);
  }
  /* ----------------------------- reads all tags ----------------------------- */

  public async readAllTags(activeUser: ActiveUserData) {
    return this.tagsRepo.find({
      where: {
        user: { id: activeUser.sub },
      },
    });
  }
  /* ------------------------- delete tags based on id ------------------------ */
  public async deleteTag(id: number, activeUser: ActiveUserData) {
    const result = await this.tagsRepo.delete({
      id,
      user: { id: activeUser.sub },
    });

    if (result.affected === 0) {
      throw new NotFoundException('Tag not found');
    }
    return {
      message: 'Tag deleted successfully',
    };
  }
  /* ------------------------ patches tags based on id ------------------------ */
  public async updateTag(
    id: number,
    dto: CreateTagDTO,
    activeUser: ActiveUserData,
  ): Promise<Tag> {
    const tag = await this.tagsRepo.findOne({
      where: {
        id,
        user: {
          id: activeUser.sub,
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (dto.name) {
      const existingTag = await this.tagsRepo.findOne({
        where: {
          name: dto.name,
          user: {
            id: activeUser.sub,
          },
        },
      });
      if (existingTag) {
        throw new ConflictException('Tag name already exists');
      }
    }
    Object.assign(tag, dto);
    return await this.tagsRepo.save(tag);
  }

  /* ------------------------- fetching array of tags ------------------------- */
  public async findTagsByIds(tags: number[] | [], id: number) {
    return await this.tagsRepo.find({
      where: {
        user: { id },
        id: In(tags),
      },
    });
  }
}
