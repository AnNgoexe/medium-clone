import {
  Controller,
  Put,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import UpdateUserBodyDto from '@modules/user/update-user.body.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Request } from 'express';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';
import { I18nService } from 'nestjs-i18n';

@Controller('api')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Put('user')
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Req() req: Request,
    @Body('user') updateUserDto: UpdateUserBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const updatedUser = await this.userService.updateUser(
      userId as number,
      updateUserDto,
    );
    return {
      message: this.i18n.translate('user.update.success'),
      data: updatedUser,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Get('user')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const user = await this.userService.getCurrentUser(userId as number);
    return {
      message: this.i18n.translate('user.get.success'),
      data: user,
    };
  }
}
