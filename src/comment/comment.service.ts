import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommentRequest } from 'src/model/post.model';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async createComment({ content, postId }: CommentRequest, token: string) {
    const tokenVerified = await this.tokenService.verify(token);
    const user = await this.userService.findById(tokenVerified.sub);

    try {
      await this.prisma.comment.create({
        data: { content, postId, userId: user.id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to comment.');
    }
  }

  async deleteComment(postId: string) {
    if (!postId) {
      throw new BadRequestException(`Missing property 'postId' in the param`);
    }
    try {
      await this.prisma.comment.updateMany({
        data: { status: true },
        where: { postId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete comment.');
    }
  }
}
