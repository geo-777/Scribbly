import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserData } from '../interfaces/active-user.interface';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { IS_PUBLIC_KEY } from '../decorators/public-route.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.accessToken as string | undefined;
    if (!token) throw new UnauthorizedException('Access token missing.');

    try {
      const payload = await this.jwtService.verifyAsync<ActiveUserData>(
        token,
        this.jwtConfiguration,
      );
      request.user = payload;

      return true;
    } catch (err) {
      console.log('Error while parsing token : ', err);
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
