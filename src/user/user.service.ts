import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserPayload, UserResponse } from 'src/model/user.model';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
}
