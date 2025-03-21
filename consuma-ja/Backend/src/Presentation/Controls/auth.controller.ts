import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../Application/Services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { login: string; senha: string }) {
    return this.authService.login(body.login, body.senha);
  }
}
