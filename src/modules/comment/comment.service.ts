import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from '@common/service/prisma.service';
import {
  ERROR_ARTICLE_NOT_FOUND,
  ERROR_COMMENT_NOT_FOUND,
  ERROR_FORBIDDEN_DELETE_COMMENT,
} from '@common/constant/error.constant';
import {
  MultipleCommentResponse,
  SingleCommentResponse,
} from '@common/type/comment-response.interface';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  async createComment(
    userId: number,
    body: string,
    slug: string,
  ): Promise<SingleCommentResponse> {
    const article = await this.prisma.article.findFirst({
      where: {
        AND: [
          { slug },
          {
            OR: [{ isDraft: false }, { authorId: userId }],
          },
        ],
      },
      select: { id: true },
    });
    if (!article) {
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.get.error'),
      });
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: body,
        authorId: userId,
        articleId: article.id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        body: true,
        author: {
          select: { id: true, username: true, bio: true, image: true },
        },
      },
    });

    return {
      comment: {
        id: comment.id,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        body: comment.body,
        author: {
          username: comment.author.username,
          bio: comment.author.bio || '',
          image: comment.author.image || '',
        },
      },
    };
  }

  async getComments(
    userId: number | undefined,
    slug: string,
  ): Promise<MultipleCommentResponse> {
    const article = await this.prisma.article.findFirst({
      where: {
        AND: [
          { slug },
          {
            OR: [{ isDraft: false }, ...(userId ? [{ authorId: userId }] : [])],
          },
        ],
      },
      select: {
        comments: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            body: true,
            author: {
              select: { id: true, image: true, bio: true, username: true },
            },
          },
        },
      },
    });
    if (!article) {
      throw new NotFoundException({
        ...ERROR_ARTICLE_NOT_FOUND,
        message: this.i18n.translate('article.get.error'),
      });
    }

    let followingSet = new Set<number>();
    if (userId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          followings: {
            select: { id: true },
          },
        },
      });
      if (currentUser) {
        followingSet = new Set(currentUser.followings.map((u) => u.id));
      }
    }

    const comments = article.comments.map((comment) => ({
      id: comment.id,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      author: {
        username: comment.author.username,
        bio: comment.author.bio || '',
        image: comment.author.image || '',
        following:
          userId && userId !== comment.author.id
            ? followingSet.has(comment.author.id)
            : undefined,
      },
    }));

    return { comments };
  }

  async deleteComment(
    userId: number,
    slug: string,
    commentId: number,
  ): Promise<void> {
    const comment = await this.prisma.comment.findFirst({
      where: {
        AND: [
          { id: commentId },
          {
            article: {
              AND: [
                { slug },
                {
                  OR: [
                    { isDraft: false },
                    ...(userId ? [{ authorId: userId }] : []),
                  ],
                },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        authorId: true,
        article: { select: { slug: true } },
      },
    });

    if (!comment) {
      throw new NotFoundException({
        ...ERROR_COMMENT_NOT_FOUND,
        message: this.i18n.translate('comment.delete.error.comment_not_found'),
      });
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException({
        ...ERROR_FORBIDDEN_DELETE_COMMENT,
        message: this.i18n.translate('comment.delete.error.forbidden'),
      });
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
