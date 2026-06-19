import {
  Injectable,
  UnauthorizedException,
  RequestTimeoutException,
} from '@nestjs/common';
import { UserService } from '../../user/providers/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login-user.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async register(dto: CreateUserDto) {
    return await this.userService.createUser({
      ...dto,
      password: await this.hashingProvider.hash(dto.password),
    });
  }

  public async login(dto: LoginUserDto) {
    // Return a generic error message to avoid revealing whether the email exists.
    // This helps prevent user enumeration attacks.
    const errorMessage = 'Email or password incorrect';

    const user = await this.userService.findUserByEmail(dto.email);

    if (!user) throw new UnauthorizedException(errorMessage);
    let isEqual: boolean = false;

    try {
      isEqual = await this.hashingProvider.compare(dto.password, user.password);
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException(errorMessage);
    }
    return await this.generateTokensProvider.generateTokens(user);
  }
}
