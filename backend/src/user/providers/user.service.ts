import { Injectable } from '@nestjs/common';
import { CreateUserProvider } from './create-user.provider';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly createUserProvider: CreateUserProvider) {}

  public async createUser(dto: CreateUserDto) {
    await this.createUserProvider.createUser(dto);
    return { message: 'User registeration successful' };
  }
}
