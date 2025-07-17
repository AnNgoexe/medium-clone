import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticleService } from './article.service';
import { ERROR_INVALID_SLUG } from '@common/constant/error.constant';
import { ResponsePayload } from '@common/type/response.interface';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';

@Controller('api/')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('articles/:slug')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async getArticleBySlug(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const userId = req.user?.userId;
    const article = await this.articleService.getArticleBySlug(
      userId as number,
      slug,
    );
    return {
      message: 'Article retrieved successfully',
      data: article,
    };
  }
}
