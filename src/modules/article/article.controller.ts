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
import { Optional } from '@common/decorator/optional.decorator';
import { ListArticlesQueryDto } from '@modules/article/dto/list-articles.query.dto';
import { I18nService } from 'nestjs-i18n';

@Controller('api/')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly i18n: I18nService,
  ) {}

  @Get('articles/:slug')
  @HttpCode(HttpStatus.OK)
  @Optional()
  async getBySlug(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const userId = req.user?.userId;
    const article = await this.articleService.getArticleBySlug(slug, userId);
    return {
      message: this.i18n.translate('article.get.success'),
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
      message: this.i18n.translate('article.create.success'),
      data: article,
    };
  }

  @Delete('articles/:slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auth(AuthType.ACCESS_TOKEN)
  async delete(
    @Req() req: Request,
    @Param('slug') slug: string,
  ): Promise<ResponsePayload> {
    if (!slug || slug.trim() === '') {
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const userId = req.user?.userId;
    await this.articleService.deleteArticle(userId as number, slug);

    return {
      message: this.i18n.translate('article.delete.success'),
      data: {},
    };
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
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const userId = req.user?.userId;
    const article = await this.articleService.updateArticle(
      userId as number,
      slug,
      updateArticleDto,
    );
    return {
      message: this.i18n.translate('article.update.success'),
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
      message: this.i18n.translate('article.list.success'),
      data: articles,
    };
  }

  @Get('articles/feed')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async feed(
    @Req() req: Request,
    @Query() listArticlesQueryDto: ListArticlesQueryDto,
  ): Promise<ResponsePayload> {
    const userId = req.user?.userId as number;
    const articles = await this.articleService.feedArticles(
      userId,
      listArticlesQueryDto,
    );

    return {
      message: this.i18n.translate('article.feed.success'),
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
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const userId = req.user?.userId as number;
    const article = await this.articleService.favoriteArticle(userId, slug);
    return {
      message: this.i18n.translate('article.favorite.success'),
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
      throw new BadRequestException({
        ...ERROR_INVALID_SLUG,
        message: this.i18n.translate('article.error.bad_slug'),
      });
    }

    const userId = req.user?.userId as number;
    const article = await this.articleService.unfavoriteArticle(userId, slug);
    return {
      message: this.i18n.translate('article.unfavorite.success'),
      data: article,
    };
  }

  @Post('articles/publish')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.ACCESS_TOKEN)
  async publishDrafts(
    @Req() req: Request,
    @Body('draftSlugs') draftSlugs: string[],
  ): Promise<ResponsePayload> {
    if (!Array.isArray(draftSlugs) || draftSlugs.length === 0) {
      throw new BadRequestException({
        message: this.i18n.translate('article.publish.error.invalid_slugs'),
      });
    }

    const userId = req.user?.userId as number;
    const articles = await this.articleService.publishDrafts(
      userId,
      draftSlugs,
    );

    return {
      message: this.i18n.translate('article.publish.success', {
        args: { count: articles.articlesCount },
      }),
      data: { articles },
    };
  }
}
