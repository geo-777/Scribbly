import { Controller, Get } from '@nestjs/common';
import { TrashService } from './providers/trash.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import { type ActiveUserData } from '../auth/interfaces/active-user.interface';

@Controller('trash')
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  public getAllTrashRoute(@ActiveUser() user: ActiveUserData) {
    return this.trashService.getAllTrash(user);
  }
}
