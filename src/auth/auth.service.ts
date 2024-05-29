import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { addDays } from 'date-fns';
import { LoginRequest, RegisterRequest } from 'src/model/auth.model';
import { JwtResponse, TokenData } from 'src/model/token.model';
import { PrismaService } from 'src/prisma.service';
import { TokenService } from 'src/token/token.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'src/model/common.model';
import { UserPayload, ValidateUsername } from 'src/model/user.model';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private SALT = 10;
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private tokenService: TokenService,
  ) {}

  async login({ identity, password }: LoginRequest): Promise<JwtResponse> {
    const user = await this.userService.findOne(identity);
    if (!user) {
      throw new NotFoundException('Email or username incorrect.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password incorrect!');
    }

    const token = await this.tokenService.generateAccessToken(user);
    const refresh = await this.tokenService.generateRefreshToken(user);

    const tokenData: TokenData = {
      accessToken: token,
      refreshToken: refresh,
      accessExpires: this.addDays(1),
      refreshExpires: this.addDays(2),
    };

    await this.tokenService.createOrUpdate(user.id, tokenData);

    return {
      access_token: token,
      refresh_token: refresh,
    };
  }

  async register(data: RegisterRequest): Promise<Response<any>> {
    const { email, username, password, confirmPassword } = data;

    if (!/^[a-zA-Z][a-zA-Z0-9_.-]+$/.test(username)) {
      throw new BadRequestException(
        'Username contains letters, numbers, dots (.) and hyphens (-)',
      );
    }

    const userExisted = await this.userService.findEmail(email);
    const isUsernameExisted = await this.userService.checkUsername(username);

    if (userExisted.email) {
      throw new BadRequestException('Email already existed.');
    } else if (isUsernameExisted) {
      throw new BadRequestException('Username already existed.');
    } else if (password !== confirmPassword) {
      throw new BadRequestException('Confirm password incorrect!');
    }

    const hash = await bcrypt.hash(password, this.SALT);
    const payload: UserPayload = {
      email,
      username,
      password: hash,
      role: 'user',
    };

    await this.userService.save(payload);

    const res: Response<any> = {
      status: 201,
      message: 'Register successfully!',
    };

    return res;
  }

  async refreshToken(refreshToken: string): Promise<JwtResponse> {
    try {
      const decodedToken = await this.tokenService.verify(refreshToken);
      const user = await this.userService.findById(decodedToken.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newToken = await this.tokenService.generateAccessToken(user);
      const newRefreshToken =
        await this.tokenService.generateRefreshToken(user);

      await this.prisma.token.updateMany({
        where: { userId: user.id },
        data: {
          accessToken: newToken,
          refreshToken: newRefreshToken,
          accessExpires: this.addDays(1),
          refreshExpires: this.addDays(2),
        },
      });

      const payload: JwtResponse = {
        access_token: newToken,
        refresh_token: newRefreshToken,
      };

      return payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Refresh token invalid!');
      }

      throw new InternalServerErrorException('Cannot refresh token');
    }
  }

  async revokeToken(token: string): Promise<Response<any>> {
    const decodedToken = await this.tokenService.verify(token);
    if (!decodedToken) {
      throw new UnauthorizedException('Token invalid!');
    }

    try {
      await this.prisma.token.delete({ where: { accessToken: token } });
      const res: Response<any> = {
        status: 200,
        message: 'Revoke token successful',
      };
      return res;
    } catch (error) {
      throw new InternalServerErrorException('Cannot revoke token.');
    }
  }

  async validate(request: ValidateUsername): Promise<boolean> {
    return await this.userService.checkUsername(request.username);
  }

  private addDays(days: number): Date {
    return addDays(new Date(), days + 1);
  }
}
