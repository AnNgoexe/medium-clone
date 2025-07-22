import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponsePayload } from '@common/type/response.interface';
import { CommentService } from '@modules/comment/comment.service';
import CreateCommentBodyDto from '@modules/comment/create-comment.body.dto';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';
import { I18nService } from 'nestjs-i18n';
import { ERROR_INVALID_SLUG } from '@common/constant/error.constant';

@Controller('api/articles/:slug')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly i18n: I18nService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.ACCESS_TOKEN)
  @Post('comments')
  async createComment(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Body('comment') createCommentBodyDto: CreateCommentBodyDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const { body } = createCommentBodyDto;

    if (!slug || slug.trim() === '') {
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const comment = await this.commentService.createComment(
      userId as number,
      body,
      slug,
    );

    return {
      message: this.i18n.translate('comment.create.success'),
      data: comment,
    };
  }

  @Get('comments')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.OPTIONAL)
  async getComments(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;

    if (!slug || slug.trim() === '') {
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const comments = await this.commentService.getComments(userId, slug);
    return {
      message: this.i18n.translate('comment.list.success'),
      data: comments,
    };
  }

  @Delete('comments/:id')
  @Auth(AuthType.ACCESS_TOKEN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) commentId: number,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    if (!slug || slug.trim() === '') {
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    await this.commentService.deleteComment(userId as number, slug, commentId);

    return {
      message: this.i18n.translate('comment.delete.success'),
      data: {},
    };
  }
}
