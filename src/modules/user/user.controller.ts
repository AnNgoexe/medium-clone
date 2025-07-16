import {
  Controller,
  Put,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import UpdateUserDto from '@modules/user/update-user.dto';
import { ResponsePayload } from '@common/type/response.interface';
import { Request } from 'express';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth(AuthType.ACCESS_TOKEN)
  @Put('user')
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Req() req: Request,
    @Body('user') dto: UpdateUserDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const updatedUser = await this.userService.updateUser(
      userId as number,
      dto,
    );
    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }
}
