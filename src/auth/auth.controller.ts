import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest, RegisterRequest } from 'src/model/auth.model';
import { JwtResponse, RefreshTokenRequest } from 'src/model/token.model';
import { AuthGuard } from './auth.guard';
import { ValidateUsername } from 'src/model/user.model';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() data: LoginRequest): Promise<JwtResponse> {
    return this.authService.login(data);
  }

  @Post('register')
  async register(@Body() data: RegisterRequest) {
    return this.authService.register(data);
  }

  @Post('refreshToken')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async refreshToken(
    @Body() request: RefreshTokenRequest,
  ): Promise<JwtResponse> {
    return this.authService.refreshToken(request.refreshToken);
  }

  @Delete('revoke')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async revokeToken(@Headers('authorization') token: string) {
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.authService.revokeToken(tokenWithoutPrefix);
  }

  @Post('username/validate')
  @HttpCode(200)
  async validateUsername(
    @Body() request: ValidateUsername,
    @Res() res: Response,
  ) {
    const isExisted = await this.authService.validate(request);
    if (isExisted) {
      throw new BadRequestException(
        `username '${request.username}' is already taken.`,
      );
    }

    res.status(HttpStatus.OK).json({ message: 'OK' });
  }
}
