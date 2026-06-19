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
import { ApiCookieAuth } from '@nestjs/swagger';
import { setAuthCookies } from './helpers/set-auth-cookies';
import { clearAuthCookies } from './helpers/clear-auth-cookies';

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
    setAuthCookies(response, result);
    return { message: 'Login successful' };
  }

  /* ----------------------------- Logout endpoint ---------------------------- */
  @Post('logout')
  @HttpCode(200)
  public logoutRoute(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);
    return { message: 'Logout successful' };
  }

  /* ------------------------- Refresh token endpoint ------------------------- */
  @PublicRoute()
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
  public meRoute(@ActiveUser() user: ActiveUserData) {
    return this.authService.meRouteDetailsFetcher(user);
  }
}
