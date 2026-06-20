import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { NotesService } from './providers/notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { type ActiveUserData } from '../auth/interfaces/active-user.interface';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  //   @Get('/?tag')
  //   public getNotesRoute(@Query('tag', ParseIntPipe) tag: number) {

  @Post()
  public createNoteRoute(
    @Body() dto: CreateNoteDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.notesService.createNote(dto, activeUser);
  }

  @Delete('/:id')
  public deleteNoteRoute(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.notesService.deleteNote(id, activeUser);
  }
}
