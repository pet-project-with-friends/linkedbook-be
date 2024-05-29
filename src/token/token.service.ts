import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { jwtConstants } from 'src/constants/jwtConstants';
import { JwtPayload, TokenData, TokenPayload } from 'src/model/token.model';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateAccessToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(user: User): Promise<string> {
    return await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '30d' },
    );
  }

  async verify(token: string): Promise<JwtPayload | undefined> {
    return await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });
  }

  async createOrUpdate(id: string, data: TokenData) {
    try {
      const tokenExist = await this.prisma.token.findFirst({
        where: { userId: id },
      });

      if (tokenExist) {
        await this.prisma.token.updateMany({
          where: { userId: id },
          data: data,
        });
      } else {
        await this.prisma.token.create({
          data: {
            userId: id,
            ...data,
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException('Cannot create token.');
    }
  }
}
