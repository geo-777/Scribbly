import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/providers/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async register(dto: CreateUserDto) {
    return await this.userService.createUser({
      ...dto,
      password: await this.hashingProvider.hash(dto.password),
    });
  }
}
