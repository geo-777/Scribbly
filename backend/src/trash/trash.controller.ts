import { Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { TrashService } from './providers/trash.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { type ActiveUserData } from '../auth/interfaces/active-user.interface';
import {
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { TRASH_API_RESPONSE } from './constants/trash-api-response.constant';

@ApiTags('trash')
@Controller('trash')
@ApiCookieAuth('accessToken')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  /* ------------------------------ get all trash ----------------------------- */
  @Get()
  @ApiOkResponse({ example: TRASH_API_RESPONSE })
  public getAllTrashRoute(@ActiveUser() user: ActiveUserData) {
    return this.trashService.getAllTrash(user);
  }
  /* ------------------------------ restore trash ----------------------------- */
  @ApiQuery({
    name: 'id',
    required: false,
  })
  @Post('restore')
  @ApiOkResponse({ example: { message: 'Restored successfully' } })
  public retoreTrash(
    @ActiveUser() user: ActiveUserData,
    @Query('id') id?: string,
  ) {
    return this.trashService.restoreTrash(
      id !== undefined ? Number(id) : null,
      user,
    );
  }
  /* ------------------------------- clear trash ------------------------------ */
  @ApiQuery({
    name: 'id',
    required: false,
  })
  @Delete('clear')
  @ApiOkResponse({ example: { message: 'Cleared successfully' } })
  public clearTrash(
    @ActiveUser() user: ActiveUserData,
    @Query('id') id?: string,
  ) {
    return this.trashService.clearTrash(
      id !== undefined ? Number(id) : null,
      user,
    );
  }
}
