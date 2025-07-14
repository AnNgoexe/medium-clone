import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Public } from '@common/decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<ResponsePayload> {
    const { email, password } = loginDto;
    const tokens = await this.authService.validateUser(email, password);

    return {
      message: 'Login successful',
      data: tokens,
    };
  }
}
