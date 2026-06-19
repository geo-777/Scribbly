import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './providers/auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from './constants/auth.constants';
import { ActiveUser } from './decorators/active-user.decorator';
import type { ActiveUserData } from './interfaces/active-user.interface';
import { PublicRoute } from './decorators/public-route.decorator';
import { ApiCookieAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  /* ---------------------------- Register endpoint --------------------------- */
  @PublicRoute()
  @Post('register')
  public registerRoute(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  /* ----------------------------- Login Endpoint ----------------------------- */
  @PublicRoute()
  @Post('login')
  @HttpCode(200)
  public async loginRoute(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    //fetching tokens
    const result = await this.authService.login(dto);

    //setting up cookies
    response.cookie(
      'accessToken',
      result.accessToken,
      ACCESS_TOKEN_COOKIE_OPTIONS,
    );
    response.cookie(
      'refreshToken',
      result.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    return { message: 'Login successful' };
  }

  /* ------------------------------- Me endpoint ------------------------------ */
  @Get('me')
  @ApiCookieAuth('accessToken')
  public meRoute(@ActiveUser() user: ActiveUserData) {
    console.log('Islogged in', user);
  }
}
