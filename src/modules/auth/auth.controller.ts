import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginBodyDto from './dto/login.body.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Public } from '@common/decorator/public.decorator';
import RegisterBodyDto from '@modules/auth/dto/register.body.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/users/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body('user') loginDto: LoginBodyDto): Promise<ResponsePayload> {
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
    @Body('user') registerDto: RegisterBodyDto,
  ): Promise<ResponsePayload> {
    const { username, email, password } = registerDto;
    const user = await this.authService.register(username, email, password);

    return {
      message: 'Register successful',
      data: user,
    };
  }
}
