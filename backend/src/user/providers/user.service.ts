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
  /* ---------------------------- create user in db --------------------------- */
  public async createUser(dto: CreateUserDto) {
    await this.createUserProvider.createUser(dto);
    return { message: 'Register successful' };
  }

  /* --------------------------- find user with mail -------------------------- */
  /*
  This method intentionally does not throw when a user is not found.

  It is primarily used by the authentication flow, where user existence
  checks and credential validation are handled together. Returning null
  instead of throwing helps avoid leaking whether an email address exists
  in the system.
  */
  public findOneUserByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  /* ---------------------------- find user with id --------------------------- */
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
