import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Post } from '@prisma/client';
import { Status } from 'src/model/common.model';
import {
  LikeRequest,
  PostPagination,
  PostRequest,
  PostResponse,
} from 'src/model/post.model';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async create({ content }: PostRequest, token: string) {
    const strLen = content?.trim().length;
    if (content === undefined || strLen <= 15 || strLen >= 2000) {
      throw new BadRequestException('Content must be 15 to 2000 characters.');
    }

    const tokenVerified = await this.tokenService.verify(token);
    if (!tokenVerified) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(tokenVerified.sub);

    try {
      await this.prisma.post.create({
        data: { content, userId: user.id },
      });
    } catch (e) {
      throw new InternalServerErrorException('Cannot create new post.');
    }
  }

  async update(id: string, { content }: PostRequest): Promise<void> {
    const postExisted = await this.findById(id);
    if (!postExisted) {
      throw new NotFoundException('Post not found.');
    }

    try {
      await this.prisma.post.updateMany({
        where: { id },
        data: { content },
      });
    } catch (error) {
      throw new InternalServerErrorException('Cannot update post.');
    }
  }

  async delete(id: string): Promise<void> {
    const isExisted = await this.findById(id);
    if (!isExisted) {
      throw new NotFoundException('Post not found.');
    }

    try {
      await this.prisma.post.updateMany({
        where: { id },
        data: { status: Status.Deleted },
      });
    } catch (error) {
      throw new InternalServerErrorException('Cannot delete post.');
    }
  }

  async getPagination(pagination: PostPagination): Promise<PostResponse[]> {
    const skip = parseInt(pagination.skip, 10);
    const limit = parseInt(pagination.limit, 10);

    if (isNaN(skip) || isNaN(limit)) {
      throw new BadRequestException('Invalid value skip or limit');
    }

    try {
      const posts = await this.prisma.post.findMany({
        skip,
        take: limit,
        where: { status: Status.Active },
        orderBy: { createAt: 'desc' },
        include: { likes: true, author: true },
      });
      if (posts.length <= 0) {
        throw new NotFoundException('Empty list.');
      }

      const res: PostResponse[] = [];

      posts.forEach((post) => {
        res.push({
          id: post.id,
          content: post.content,
          author: post.author.username,
          createAt: post.createAt,
          likes: post.likes.length,
        });
      });

      return res;
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      }

      throw new ServiceUnavailableException();
    }
  }

  async likeOrNot({ postId, type }: LikeRequest, token: string): Promise<any> {
    const tokenVerified = await this.tokenService.verify(token);
    if (!tokenVerified) {
      throw new UnauthorizedException();
    }

    try {
      const user = await this.userService.findById(tokenVerified.sub);
      if (type === 'like') {
        const isExist = await this.prisma.like.findFirst({
          where: { userId: user.id, postId },
        });
        if (isExist) {
          throw new BadRequestException('Cannot like one post 2 times.');
        }
        await this.prisma.like.create({
          data: {
            postId,
            userId: user.id,
          },
        });
      } else if (type === 'unlike') {
        await this.prisma.like.deleteMany({ where: { postId } });
      } else {
        throw new BadRequestException('Only accept type is like or unlike.');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Cannot like.');
    }
  }

  private async findById(id: string): Promise<Post | undefined> {
    return await this.prisma.post.findUnique({
      where: { id, status: Status.Active },
    });
  }
}
