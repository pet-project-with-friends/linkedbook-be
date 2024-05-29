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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identity: { type: 'string', example: 'username | email' },
        password: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Email or username incorrect.' })
  @ApiResponse({ status: 400, description: 'Password incorrect!' })
  async login(@Body() data: LoginRequest): Promise<JwtResponse> {
    return this.authService.login(data);
  }

  @Post('register')
  @ApiOperation({ summary: 'Regist new account' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'string' },
        username: { type: 'string', example: 'string' },
        password: { type: 'string', example: 'string' },
        usernaconfirmPasswordme: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Register successfully!' })
  @ApiResponse({ status: 400 })
  async register(@Body() data: RegisterRequest) {
    return this.authService.register(data);
  }

  @Post('refreshToken')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Refesh new token' })
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 500, description: 'Cannot refresh token.' })
  async refreshToken(
    @Body() request: RefreshTokenRequest,
  ): Promise<JwtResponse> {
    return this.authService.refreshToken(request.refreshToken);
  }

  @Delete('revoke')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout and remove token' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Token invalid!' })
  @ApiResponse({ status: 500, description: 'Cannot revoke token.' })
  async revokeToken(@Headers('authorization') token: string) {
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.authService.revokeToken(tokenWithoutPrefix);
  }

  @Post('username/validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Check existing username' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
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
