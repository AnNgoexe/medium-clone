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
  ERROR_ALREADY_FAVORITED,
  ERROR_NOT_FAVORITED_YET,
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
import { I18nService } from 'nestjs-i18n';
import {
  HighInteractionArticleStatsResponse,
  MonthlyHighInteractionStat,
} from '@common/type/article-stats-response.interface';
import { Prisma } from '@prisma/client';
import { FeedArticlesQueryDto } from '@modules/article/dto/feed-article.query.dto';
import { MIN_INTERACTION_REACTIONS } from '@common/constant/article.constant';

@Injectable()
export class ArticleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async getArticleBySlug(
    slug: string,
    currentUserId: number | undefined,
  ): Promise<SingleArticleResponse> {
    const article = await this.prismaService.article.findFirst({
      where: {
        AND: [
          { slug },
          {
            OR: [
              { isDraft: false },
              ...(currentUserId ? [{ authorId: currentUserId }] : []),
            ],
          },
        ],
      },
      select: {
        slug: true,
        title: true,
        description: true,
        body: true,
        tagList: { select: { name: true } },
        isDraft: true,
        createdAt: true,
        updatedAt: true,
        favoritedBy: { select: { userId: true } },
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        comments: { select: { id: true } },
      },
    });

    if (!article)
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.get.error'),
      });

    return { article: this.buildArticleResponse(article, currentUserId) };
  }

  async createArticle(
    userId: number,
    createArticleDto: CreateArticleBodyDto,
  ): Promise<SingleArticleResponse> {
    const {
      title,
      description,
      body,
      tagList = [],
      isDraft = true,
    } = createArticleDto;

    const slug = slugify(title, { lower: true });
    const existing = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing)
      throw new ConflictException({
        ...ERROR_ARTICLE_CONFLICT,
        message: this.i18n.translate('article.create.error'),
      });

    const article = await this.prismaService.article.create({
      data: {
        slug,
        title,
        description,
        body,
        isDraft,
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
        favoritedBy: { select: { userId: true } },
        comments: { select: { id: true } },
      },
    });

    return { article: this.buildArticleResponse(article) };
  }

  async deleteArticle(userId: number, slug: string): Promise<void> {
    const article = await this.prismaService.article.findUnique({
      where: { slug },
      select: { id: true, authorId: true },
    });

    if (!article)
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.delete.error.not_found'),
      });

    if (article.authorId !== userId)
      throw new ForbiddenException({
        ...ERROR_FORBIDDEN_DELETE_ARTICLE,
        message: this.i18n.translate('article.delete.error.forbidden'),
      });

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

    if (!article)
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.update.error.not_found'),
      });

    if (article.authorId !== userId)
      throw new ForbiddenException({
        ...ERROR_FORBIDDEN_UPDATE_ARTICLE,
        message: this.i18n.translate('article.update.error.forbidden'),
      });

    const data: Partial<UpdateArticleBodyDto & { slug: string }> =
      updateArticleDto;
    if (updateArticleDto.title) {
      const newSlug = slugify(updateArticleDto.title, { lower: true });
      if (newSlug !== slug) {
        const conflictCount = await this.prismaService.article.count({
          where: { slug: newSlug },
        });
        if (conflictCount > 0)
          throw new ConflictException({
            ...ERROR_ARTICLE_CONFLICT,
            message: this.i18n.translate('article.update.error.conflict'),
          });
      }
      data.slug = newSlug;
    }

    const updatedArticle = await this.prismaService.article.update({
      where: { slug },
      data: data,
      include: {
        tagList: { select: { name: true } },
        favoritedBy: { select: { userId: true } },
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        comments: { select: { id: true } },
      },
    });

    return { article: this.buildArticleResponse(updatedArticle) };
  }

  async listArticles(
    userId: number | undefined,
    query: ListArticlesQueryDto,
  ): Promise<MutlipleArticleResponse> {
    const { tag, author, favorited } = query;
    const limit = query.limit ?? ARTICLE_PAGINATION_DEFAULT_LIMIT;
    const offset = query.offset ?? ARTICLE_PAGINATION_DEFAULT_OFFSET;

    const filters = [];
    if (tag) {
      filters.push({ tagList: { some: { name: tag } } });
    }
    if (author) {
      filters.push({ author: { username: author } });
    }
    if (favorited) {
      filters.push({
        favoritedBy: { some: { user: { username: favorited } } },
      });
    }
    filters.push({
      OR: [{ isDraft: false }, ...(userId ? [{ author: { id: userId } }] : [])],
    });

    const articles = await this.prismaService.article.findMany({
      where: {
        AND: filters,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        tagList: { select: { name: true } },
        favoritedBy: { select: { userId: true } },
        comments: { select: { id: true } },
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

  async feedArticles(
    currentUserId: number,
    query: FeedArticlesQueryDto,
  ): Promise<MutlipleArticleResponse> {
    const limit = query.limit ?? ARTICLE_PAGINATION_DEFAULT_LIMIT;
    const offset = query.offset ?? ARTICLE_PAGINATION_DEFAULT_OFFSET;

    const followingUsers = await this.prismaService.user.findUnique({
      where: { id: currentUserId },
      select: { followings: { select: { id: true } } },
    });

    if (!followingUsers) return { articles: [], articlesCount: 0 };

    const followingIds = followingUsers.followings.map((user) => user.id);
    if (followingIds.length === 0) return { articles: [], articlesCount: 0 };

    const articles = await this.prismaService.article.findMany({
      where: {
        authorId: { in: followingIds },
        isDraft: false,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        tagList: { select: { name: true } },
        favoritedBy: { select: { userId: true } },
        comments: { select: { id: true } },
      },
    });

    const articlesResponse = articles.map((article) =>
      this.buildArticleResponse(article, currentUserId),
    );

    return {
      articles: articlesResponse,
      articlesCount: articles.length,
    };
  }

  async favoriteArticle(
    userId: number,
    slug: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.prismaService.article.findFirst({
      where: {
        AND: [{ slug }, { OR: [{ isDraft: false }, { authorId: userId }] }],
      },
      select: {
        id: true,
        slug: true,
        favoritedBy: { select: { userId: true } },
      },
    });

    if (!article) {
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.favorite.error.not_found'),
      });
    }

    const alreadyFavorited = article.favoritedBy.some(
      (favorite) => favorite.userId === userId,
    );
    if (alreadyFavorited) {
      throw new ConflictException({
        ...ERROR_ALREADY_FAVORITED,
        message: this.i18n.translate(
          'article.favorite.error.already_favorited',
        ),
      });
    }

    await this.prismaService.favorite.create({
      data: {
        user: { connect: { id: userId } },
        article: { connect: { id: article.id } },
      },
    });

    return await this.getArticleBySlug(article.slug, userId);
  }

  async unfavoriteArticle(
    userId: number,
    slug: string,
  ): Promise<SingleArticleResponse> {
    const article = await this.prismaService.article.findFirst({
      where: {
        AND: [{ slug }, { OR: [{ isDraft: false }, { authorId: userId }] }],
      },
      select: {
        id: true,
        slug: true,
        favoritedBy: { select: { userId: true } },
      },
    });

    if (!article) {
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.unfavorite.error.not_found'),
      });
    }

    const alreadyFavorited = article.favoritedBy.some(
      (user) => user.userId === userId,
    );

    if (!alreadyFavorited) {
      throw new ConflictException({
        ...ERROR_NOT_FAVORITED_YET,
        message: this.i18n.translate(
          'article.unfavorite.error.not_favorited_yet',
        ),
      });
    }

    await this.prismaService.favorite.delete({
      where: {
        userId_articleId: {
          userId,
          articleId: article.id,
        },
      },
    });

    return await this.getArticleBySlug(article.slug, userId);
  }

  async publishDrafts(
    userId: number,
    slugs: string[],
  ): Promise<MutlipleArticleResponse> {
    const drafts = await this.prismaService.article.findMany({
      where: {
        slug: { in: slugs },
        authorId: userId,
        isDraft: true,
      },
      include: {
        tagList: { select: { name: true } },
        favoritedBy: { select: { userId: true } },
        author: {
          select: {
            username: true,
            bio: true,
            image: true,
            followers: { select: { id: true } },
          },
        },
        comments: { select: { id: true } },
      },
    });

    const foundSlugs = drafts.map((d) => d.slug);
    const notFoundSlugs = slugs.filter((slug) => !foundSlugs.includes(slug));
    if (notFoundSlugs.length > 0) {
      throw new NotFoundException({
        message: this.i18n.translate('article.publish.error', {
          args: { slugs: notFoundSlugs.join(', ') },
        }),
      });
    }

    const updatedArticles = await Promise.all(
      drafts.map((draft) =>
        this.prismaService.article.update({
          where: { slug: draft.slug },
          data: { isDraft: false },
          include: {
            tagList: { select: { name: true } },
            favoritedBy: { select: { userId: true } },
            author: {
              select: {
                id: true,
                username: true,
                bio: true,
                image: true,
                followers: { select: { id: true } },
              },
            },
            comments: { select: { id: true } },
          },
        }),
      ),
    );

    return {
      articles: updatedArticles.map((article) =>
        this.buildArticleResponse(article, userId),
      ),
      articlesCount: updatedArticles.length,
    };
  }

  async getArticleHighInteractionStatistics(
    userId: number,
  ): Promise<HighInteractionArticleStatsResponse> {
    let articles = await this.prismaService.$queryRaw<
      MonthlyHighInteractionStat[]
    >(
      Prisma.sql`
      SELECT
        EXTRACT(YEAR FROM a."createdAt")::int AS year,
        EXTRACT(MONTH FROM a."createdAt")::int AS month,
        a."slug",
        COUNT(DISTINCT c."id") AS comments,
        COUNT(DISTINCT f."userId") AS likes,
        (COUNT(DISTINCT c."id") + COUNT(DISTINCT f."userId")) AS totalInteraction
      FROM "articles" a
      LEFT JOIN "comments" c ON c."articleId" = a."id"
      LEFT JOIN "favorites" f ON f."articleId" = a."id"
      WHERE a."authorId" = ${userId}
      GROUP BY year, month, a."slug"
      HAVING (COUNT(DISTINCT c."id") + COUNT(DISTINCT f."userId")) >= ${MIN_INTERACTION_REACTIONS}
      ORDER BY year DESC, month DESC`,
    );

    articles = articles.map((article) => ({
      ...article,
      comments: Number(article.comments),
      likes: Number(article.likes),
      totalInteractions: Number(article.comments) + Number(article.likes),
    }));

    return { articles };
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
      isDraft: article.isDraft,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      favorited: userId
        ? article.favoritedBy.some((user) => user.userId === userId)
        : undefined,
      favoritesCount: article.favoritedBy.length,
      commentsCount: article.comments.length,
      author: {
        username: article.author.username,
        bio: article.author.bio,
        image: article.author.image,
        following:
          !userId || article.author.id === userId
            ? undefined
            : article.author.followers.some((f) => f.id === userId),
      },
    };
  }
}
