import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserProvider } from './create-user.provider';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly createUserProvider: CreateUserProvider,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  public async createUser(dto: CreateUserDto) {
    await this.createUserProvider.createUser(dto);
    return { message: 'User registeration successful' };
  }
  public findOneUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }
  public async findOneUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
