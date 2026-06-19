import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthService } from './providers/auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  public registerRoute(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }
  @Post('login')
  public loginRoute(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
