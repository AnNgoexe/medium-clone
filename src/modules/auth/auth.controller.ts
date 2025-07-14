import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Public } from '@common/decorator/public.decorator';
import RegisterDto from '@modules/auth/dto/register.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/users/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body('user') loginDto: LoginDto): Promise<ResponsePayload> {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);

    return {
      message: 'Login successful',
      data: user,
    };
  }

  @Post('/users')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('user') registerDto: RegisterDto,
  ): Promise<ResponsePayload> {
    const { username, email, password } = registerDto;
    const user = await this.authService.register(username, email, password);

    return {
      message: 'Register successful',
      data: user,
    };
  }
}
