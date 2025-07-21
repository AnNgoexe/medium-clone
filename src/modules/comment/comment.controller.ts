import {
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

@Controller('api/articles/:slug')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

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

    const comment = await this.commentService.createComment(
      userId as number,
      body,
      slug,
    );

    return {
      message: 'Comment created successfully',
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

    const comments = await this.commentService.getComments(userId, slug);
    return {
      message: 'Get comments successfully',
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
    await this.commentService.deleteComment(userId as number, slug, commentId);

    return {
      message: 'Delete comment successfully',
      data: {},
    };
  }
}
