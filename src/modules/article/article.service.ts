import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import {
  ERROR_ARTICLE_NOT_FOUND,
  ERROR_ARTICLE_CONFLICT,
} from '@common/constant/error.constant';
import { CreateArticleDto } from '@modules/article/dto/create-article.dto';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getArticleBySlug(userId: number, slug: string): Promise<object> {
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
        favoritedBy: {
          select: { id: true },
        },
        author: {
          select: {
            id: true,
            username: true,
            bio: true,
            image: true,
            followers: {
              select: { id: true },
              where: { id: userId },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(ERROR_ARTICLE_NOT_FOUND);
    }

    const isAuthor = article.author.id === userId;

    return {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList.map((tag) => tag.name),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favoritedBy.some((user) => user.id === userId),
        favoritesCount: article.favoritedBy.length,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
          following: isAuthor ? undefined : article.author.followers.length > 0,
        },
      },
    };
  }

  async createArticle(
    userId: number,
    createArticleDto: CreateArticleDto,
  ): Promise<object> {
    const { title, description, body, tagList = [] } = createArticleDto;

    const slug = slugify(title, { lower: true });
    const existing = await this.prismaService.article.findUnique({
      where: {
        slug: slug,
        title: title,
      },
    });
    if (existing) {
      throw new ConflictException(ERROR_ARTICLE_CONFLICT);
    }

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
          select: { username: true, bio: true, image: true },
        },
        tagList: true,
        favoritedBy: {
          select: { id: true },
        },
      },
    });

    return {
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList.map((tag) => tag.name),
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        favorited: article.favoritedBy.some((user) => user.id === userId),
        favoritesCount: article.favoritedBy.length,
        author: {
          username: article.author.username,
          bio: article.author.bio,
          image: article.author.image,
        },
      },
    };
  }
}
