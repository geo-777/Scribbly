import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './providers/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Request, Response } from 'express';
import { ActiveUser } from './decorators/active-user.decorator';
import type { ActiveUserData } from './interfaces/active-user.interface';
import { PublicRoute } from './decorators/public-route.decorator';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { setAuthCookies } from './helpers/set-auth-cookies';
import { clearAuthCookies } from './helpers/clear-auth-cookies';
import {
  LOGIN_LIMITS,
  REFRESH_LIMITS,
  REGISTER_LIMITS,
} from './constants/rate-limit-constants';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /* ---------------------------- Register endpoint --------------------------- */
  @PublicRoute()
  @Throttle({ default: REGISTER_LIMITS })
  @ApiOkResponse({
    example: { message: 'Register successful' },
  })
  @Post('register')
  public registerRoute(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  /* ----------------------------- Login Endpoint ----------------------------- */
  @PublicRoute()
  @Throttle({ default: LOGIN_LIMITS })
  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ example: { message: 'Login successful' } })
  public async loginRoute(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    //fetching tokens
    const result = await this.authService.login(dto);
    //setting up cookies
    setAuthCookies(response, result);
    return { message: 'Login successful' };
  }

  /* ----------------------------- Logout endpoint ---------------------------- */
  @Post('logout')
  @ApiOkResponse({ example: { message: 'Logout successful' } })
  @HttpCode(200)
  public logoutRoute(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
    return { message: 'Logout successful' };
  }

  /* ------------------------- Refresh token endpoint ------------------------- */
  @PublicRoute()
  @Throttle({ default: REFRESH_LIMITS })
  @ApiOkResponse({ example: { message: 'Refresh successful' } })
  @Post('refresh')
  @HttpCode(200)
  public async refreshRoute(
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
  ) {
    const result = await this.authService.refreshToken(req);
    setAuthCookies(response, result);
    return { message: 'Refresh successful' };
  }
  /* ------------------------------- Me endpoint ------------------------------ */
  @Get('me')
  @ApiCookieAuth('accessToken')
  @ApiOkResponse({
    example: {
      id: 1,
      username: 'username',
      email: 'user@gmail.com',
      createdAt: '2026-06-18T12:12:13.190Z',
    },
  })
  public meRoute(@ActiveUser() user: ActiveUserData) {
    return this.authService.meRouteDetailsFetcher(user);
  }
}
