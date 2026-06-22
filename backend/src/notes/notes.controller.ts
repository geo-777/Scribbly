import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { NotesService } from './providers/notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { type ActiveUserData } from '../auth/interfaces/active-user.interface';
import { UpdateNoteDto } from './dto/update-note.dto';
import { GetNotesQueryDto } from './dto/get-query.dto';
import { Note } from './note.entity';
import { PublicRoute } from '../auth/decorators/public-route.decorator';

@Controller('notes')
@ApiTags('Notes')
@ApiCookieAuth('accessToken')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Get notes for active user' })
  @ApiResponse({
    status: 200,
    description: 'List of notes',
    type: Note,
    isArray: true,
  })
  public getNotesRoute(
    @Query() querydto: GetNotesQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.notesService.getNotes(activeUser, querydto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created', type: Note })
  @ApiBody({ type: CreateNoteDto })
  public createNoteRoute(
    @Body() dto: CreateNoteDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.notesService.createNote(dto, activeUser);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a note by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Note deleted' })
  public deleteNoteRoute(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.notesService.deleteNote(id, activeUser);
  }

  @Patch('/:id')
  @ApiOperation({ summary: 'Update a note by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Note updated', type: Note })
  public patchNoteRoute(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: ActiveUserData,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(id, dto, user);
  }

  @Get('public/:id')
  @PublicRoute()
  public getPublicNote(@Param('id', ParseIntPipe) id: number) {
    return this.notesService.getPublicNote(id);
  }
}
