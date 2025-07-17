import {
  Controller,
  Put,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import UpdateUserBodyDto from '@modules/user/update-user.body.dto';
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
    @Body('user') updateUserDto: UpdateUserBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const updatedUser = await this.userService.updateUser(
      userId as number,
      updateUserDto,
    );
    return {
      message: 'User updated successfully',
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
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Post('profiles/:username/follow')
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const result = await this.userService.followUser(
      userId as number,
      username,
    );
    return {
      message: 'Followed user successfully',
      data: result,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Delete('profiles/:username/follow')
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const result = await this.userService.unfollowUser(
      userId as number,
      username,
    );
    return {
      message: 'Unfollowed user successfully',
      data: result,
    };
  }
}
