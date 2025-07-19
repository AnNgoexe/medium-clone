import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import {
  ERROR_ARTICLE_NOT_FOUND,
  ERROR_ARTICLE_CONFLICT,
  ERROR_FORBIDDEN_DELETE_ARTICLE,
  ERROR_FORBIDDEN_UPDATE_ARTICLE,
} from '@common/constant/error.constant';
import { CreateArticleBodyDto } from '@modules/article/dto/create-article.body.dto';
import { UpdateArticleBodyDto } from '@modules/article/dto/update-article.body.dto';
import { ListArticlesQueryDto } from '@modules/article/dto/list-articles.query.dto';
import {
  Article,
  SingleArticleResponse,
  ArticleResponseData,
  MutlipleArticleResponse,
} from '@common/type/article-response.interface';
import slugify from 'slugify';
import {
  ARTICLE_PAGINATION_DEFAULT_LIMIT,
  ARTICLE_PAGINATION_DEFAULT_OFFSET,
} from '@common/constant/pagination.constant';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getArticleBySlug(slug: string): Promise<SingleArticleResponse> {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tagList: true,
        createdAt: true,
        updatedAt: true,
        favoritedBy: { select: { id: true } },
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
      },
    });

    if (!article) throw new NotFoundException(ERROR_ARTICLE_NOT_FOUND);

    return { article: this.buildArticleResponse(article) };
  }

  async createArticle(
    userId: number,
    createArticleDto: CreateArticleBodyDto,
  ): Promise<SingleArticleResponse> {
    const { title, description, body, tagList = [] } = createArticleDto;

    const slug = slugify(title, { lower: true });
    const existing = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) throw new ConflictException(ERROR_ARTICLE_CONFLICT);

    const article = await this.prismaService.article.create({
      data: {
        slug,
        title,
        description,
        body,
        authorId: userId,
        tagList: {
          connectOrCreate: tagList.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        tagList: { select: { name: true } },
        favoritedBy: { select: { id: true } },
      },
    });

    return { article: this.buildArticleResponse(article) };
  }

  async deleteArticle(userId: number, slug: string): Promise<void> {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!article) throw new NotFoundException(ERROR_ARTICLE_NOT_FOUND);

    if (article.authorId !== userId)
      throw new ForbiddenException(ERROR_FORBIDDEN_DELETE_ARTICLE);

    await this.prismaService.article.delete({
      where: { slug },
    });
  }

  async updateArticle(
    userId: number,
    slug: string,
    updateArticleDto: UpdateArticleBodyDto,
  ): Promise<SingleArticleResponse> {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!article) throw new NotFoundException(ERROR_ARTICLE_NOT_FOUND);

    if (article.authorId !== userId)
      throw new ForbiddenException(ERROR_FORBIDDEN_UPDATE_ARTICLE);

    const data: Partial<UpdateArticleBodyDto & { slug: string }> =
      updateArticleDto;
    if (updateArticleDto.title) {
      const newSlug = slugify(updateArticleDto.title, { lower: true });
      if (newSlug !== slug) {
        const conflictCount = await this.prismaService.article.count({
          where: { slug: newSlug },
        });
        if (conflictCount > 0)
          throw new ConflictException(ERROR_ARTICLE_CONFLICT);
      }
      data.slug = newSlug;
    }

    const updatedArticle = await this.prismaService.article.update({
      where: { slug },
      data: data,
      include: {
        tagList: { select: { name: true } },
        favoritedBy: { select: { id: true } },
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
      },
    });

    return { article: this.buildArticleResponse(updatedArticle, userId) };
  }

  async listArticles(
    userId: number | undefined,
    query: ListArticlesQueryDto,
  ): Promise<MutlipleArticleResponse> {
    const { tag, author, favorited } = query;
    const limit = query.limit ?? ARTICLE_PAGINATION_DEFAULT_LIMIT;
    const offset = query.offset ?? ARTICLE_PAGINATION_DEFAULT_OFFSET;

    const articles = await this.prismaService.article.findMany({
      where: {
        tagList: { some: { name: tag } },
        author: { username: author },
        favoritedBy: { some: { username: favorited } },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        tagList: { select: { name: true } },
        favoritedBy: { select: { id: true } },
      },
    });

    const articlesResponse = articles.map((article) =>
      this.buildArticleResponse(article, userId),
    );

    return {
      articles: articlesResponse,
      articlesCount: articlesResponse.length,
    };
  }

  private buildArticleResponse(
    article: Article,
    userId?: number,
  ): ArticleResponseData {
    return {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: article.tagList.map((tag) => tag.name),
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: userId
        ? article.favoritedBy.some((user) => user.id === userId)
        : undefined,
      favoritesCount: article.favoritedBy.length,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following: userId
          ? article.author.followers.some((follower) => follower.id === userId)
          : undefined,
      },
    };
  }
}
