import {
  Injectable,
  UnauthorizedException,
  RequestTimeoutException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../../user/providers/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { HashingProvider } from './hashing.provider';
import { LoginUserDto } from '../dto/login-user.dto';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { ActiveUserData } from '../interfaces/active-user.interface';
import { type Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { type ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguratin: ConfigType<typeof jwtConfig>,
  ) {}

  /* --------------------------- create user entity --------------------------- */
  public async register(dto: CreateUserDto) {
    return await this.userService.createUser({
      ...dto,
      password: await this.hashingProvider.hash(dto.password),
    });
  }
  /* ---------------------- returns tokens to controller ---------------------- */
  public async login(dto: LoginUserDto) {
    // Return a generic error message to avoid revealing whether the email exists.
    // This helps prevent user enumeration attacks.
    const errorMessage = 'Email or password incorrect';

    const user = await this.userService.findOneUserByEmail(dto.email);

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
  /* -------------------------- fetches user details -------------------------- */
  public async meRouteDetailsFetcher(user: ActiveUserData) {
    return await this.userService.findOneUserById(user.sub);
  }
  public async refreshToken(req: Request) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token not found');

    const payload = await this.jwtService.verifyAsync<ActiveUserData>(
      refreshToken,
      this.jwtConfiguratin,
    );
    if (!payload) throw new BadRequestException('Refresh token not verified');

    const user = await this.userService.findOneUserById(payload.sub);
    return await this.generateTokensProvider.generateTokens(user);
  }
}
