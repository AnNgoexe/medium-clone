import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticleService } from './article.service';
import { ERROR_INVALID_SLUG } from '@common/constant/error.constant';
import { ResponsePayload } from '@common/type/response.interface';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';
import { CreateArticleDto } from '@modules/article/dto/create-article.dto';
import { UpdateArticleDto } from '@modules/article/dto/update-article.dto';
import { Public } from '@common/decorator/public.decorator';

@Controller('api/')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('articles/:slug')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const article = await this.articleService.getArticleBySlug(slug);
    return {
      message: 'Article retrieved successfully',
      data: article,
    };
  }

  @Post('articles/')
  @HttpCode(HttpStatus.CREATED)
  @Auth(AuthType.ACCESS_TOKEN)
  async createArticle(
    @Req() req: Request,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const article = await this.articleService.createArticle(
      userId as number,
      createArticleDto,
    );
    return {
      message: 'Article created successfully',
      data: article,
    };
  }

  @Delete('articles/:slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(AuthType.ACCESS_TOKEN)
  async deleteArticle(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<void> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const userId = req.user?.userId;
    await this.articleService.deleteArticle(userId as number, slug);
  }

  @Post('articles/:slug')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async updateArticle(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const userId = req.user?.userId;
    const article = await this.articleService.updateArticle(
      userId as number,
      slug,
      updateArticleDto,
    );
    return {
      message: 'Article updated successfully',
      data: article,
    };
  }
}
