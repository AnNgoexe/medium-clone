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
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ArticleService } from './article.service';
import { ERROR_INVALID_SLUG } from '@common/constant/error.constant';
import { ResponsePayload } from '@common/type/response.interface';
import { AuthType } from '@common/type/auth-type.enum';
import { Auth } from '@common/decorator/auth.decorator';
import { CreateArticleBodyDto } from '@modules/article/dto/create-article.body.dto';
import { UpdateArticleBodyDto } from '@modules/article/dto/update-article.body.dto';
import { Public } from '@common/decorator/public.decorator';
import { Optional } from '@common/decorator/optional.decorator';
import { ListArticlesQueryDto } from '@modules/article/dto/list-articles.query.dto';

@Controller('api/')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('articles/:slug')
  @HttpCode(HttpStatus.OK)
  @Public()
  async getBySlug(@Param('slug') slug: string): Promise<ResponsePayload> {
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
  async create(
    @Req() req: Request,
    @Body('article') createArticleDto: CreateArticleBodyDto,
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
  async delete(
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
  async update(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleBodyDto,
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

  @Get('articles')
  @HttpCode(HttpStatus.OK)
  @Optional()
  async list(
    @Req() req: Request,
    @Query() listArticlesQueryDto: ListArticlesQueryDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId;
    const articles = await this.articleService.listArticles(
      userId,
      listArticlesQueryDto,
    );
    return {
      message: 'Articles retrieved successfully',
      data: articles,
    };
  }

  @Post('articles/:slug/favorite')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async favorite(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const userId = req.user?.userId as number;
    const article = await this.articleService.favoriteArticle(userId, slug);
    return {
      message: 'Article favorited successfully',
      data: article,
    };
  }

  @Delete('articles/:slug/unfavorite')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async unfavorite(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException(ERROR_INVALID_SLUG);
    }

    const userId = req.user?.userId as number;
    const article = await this.articleService.unfavoriteArticle(userId, slug);
    return {
      message: 'Article unfavorited successfully',
      data: article,
    };
  }
}
