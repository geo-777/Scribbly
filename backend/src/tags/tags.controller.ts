import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Patch,
  Param,
} from '@nestjs/common';
import { TagsService } from './providers/tags.service';
import { CreateTagDTO } from './dtos/create-tag.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user.interface';
import { ApiOkResponse } from '@nestjs/swagger';
import { API_OK_RESPONSE } from './constants/tags-api-response-constant';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagService: TagsService) {}

  /* --------------------------- create tag endpoint -------------------------- */
  @Post()
  @ApiOkResponse({
    example: API_OK_RESPONSE[0],
  })
  public createTagRoute(
    @Body() dto: CreateTagDTO,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.tagService.createTag(dto, user);
  }
  /* -------------------------- get all tag endpoint -------------------------- */
  @Get()
  @ApiOkResponse({ example: API_OK_RESPONSE })
  public readAllTagsRoute(@ActiveUser() user: ActiveUserData) {
    return this.tagService.readAllTags(user);
  }
  /* --------------------------- delete tag endpoint -------------------------- */
  @Delete('/:id')
  @ApiOkResponse({ example: { message: 'Deleted succesfully' } })
  public deleteTagRoute(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.tagService.deleteTag(id, user);
  }

  @Patch('/:id')
  @ApiOkResponse({ example: API_OK_RESPONSE[1] })
  public updateTagRoute(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateTagDTO,
  ) {
    return this.tagService.updateTag(id, dto, user);
  }
}
