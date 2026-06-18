import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserProvider {
  constructor(
    /* ----------------------------- for db queries ----------------------------- */
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  public async createUser(dto: CreateUserDto) {
    let exists: User | null = null;
    try {
      exists = await this.userRepo.findOne({
        where: [{ email: dto.email }, { username: dto.username }],
      });
    } catch (error) {
      throw new RequestTimeoutException(
        `Unable to process your request at the moment please try later. Error : ${error}`,
      );
    }
    if (exists) throw new ConflictException('Email or username already in use');
    try {
      const newUser = this.userRepo.create(dto);
      return await this.userRepo.save(newUser);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((err as any)?.code === '23505') {
        throw new ConflictException('Email or username already exists.');
      }
      throw err;
    }
  }
}
