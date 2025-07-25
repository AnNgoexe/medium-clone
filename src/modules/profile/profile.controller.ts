import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { Auth } from '@common/decorator/auth.decorator';
import { AuthType } from '@common/type/auth-type.enum';
import { ResponsePayload } from '@common/type/response.interface';
import { I18nService } from 'nestjs-i18n';

@Controller('api')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly i18n: I18nService,
  ) {}

  @Get('profiles/:username')
  @Auth(AuthType.OPTIONAL)
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResponsePayload> {
    const currentUserId = req.user?.userId;
    const profile = await this.profileService.getProfile(
      currentUserId,
      username,
    );
    return {
      message: this.i18n.translate('profile.get.success', {
        args: { username: username },
      }),
      data: profile,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Post('profiles/:username/follow')
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as number;
    const profile = await this.profileService.followUser(userId, username);
    return {
      message: this.i18n.translate('profile.follow.success', {
        args: { username },
      }),
      data: profile,
    };
  }

  @Auth(AuthType.ACCESS_TOKEN)
  @Delete('profiles/:username/unfollow')
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as number;
    const profile = await this.profileService.unfollowUser(userId, username);
    return {
      message: this.i18n.translate('profile.unfollow.success', {
        args: { username },
      }),
      data: profile,
    };
  }
}
