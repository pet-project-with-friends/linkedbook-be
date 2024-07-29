import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import {
  UploadImagePayload,
  UserPayload,
  UserResponse,
} from 'src/model/user.model';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private token: TokenService,
  ) {}

  async findEmail(email: string): Promise<undefined | UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return undefined;

    return {
      email: user.email,
      createAt: user.createAt,
      role: user.role,
      username: user.username,
    };
  }

  async findOne(request: string): Promise<User | undefined> {
    let user: User | undefined;

    if (request.includes('@')) {
      user = await this.prisma.user.findUnique({ where: { email: request } });
    } else {
      user = await this.prisma.user.findUnique({
        where: { username: request },
      });
    }

    return user;
  }

  async checkUsername(username: string): Promise<boolean> {
    const user = await this.prisma.user.findMany({ where: { username } });
    return user ? true : false;
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async save(payload: UserPayload) {
    const { email, password, role, username } = payload;

    try {
      await this.prisma.user.create({
        data: {
          email,
          password,
          role,
          username,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Cannot register user.');
    }
  }

  async uploadImage(payload: UploadImagePayload, token: string) {
    const decodedToken = await this.token.verify(token);
    const user = await this.findById(decodedToken.sub);

    try {
      await this.prisma.image.updateMany({
        where: { id: user.avatarId },
        data: { url: payload.url },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload avatar!');
    }
  }

  async getImages(token: string) {
    const decodedToken = await this.token.verify(token);
    const user = await this.findById(decodedToken.sub);

    try {
      return await this.prisma.user.findMany({
        where: { avatarId: user.id },
        orderBy: { createAt: 'desc' },
        include: { image: true },
      });
    } catch (error) {
      throw new BadRequestException('Not found.');
    }
  }
}
