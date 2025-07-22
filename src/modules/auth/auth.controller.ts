import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginBodyDto from './dto/login.body.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Public } from '@common/decorator/public.decorator';
import RegisterBodyDto from '@modules/auth/dto/register.body.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('api')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}

  @Post('/users/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body('user') loginDto: LoginBodyDto): Promise<ResponsePayload> {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);

    return {
      message: this.i18n.translate('auth.login.success'),
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
      message: this.i18n.translate('auth.register.success'),
      data: user,
    };
  }
}
