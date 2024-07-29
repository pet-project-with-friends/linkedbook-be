import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UploadImagePayload } from 'src/model/user.model';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
@ApiTags('User')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Put('upload')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiResponse({ status: 200, description: 'Upload new avatar successful!' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Failed to upload avatar!' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/image.jpg' },
      },
    },
  })
  async uploadImage(@Req() req: Request, @Body() payload: UploadImagePayload) {
    const token = req.headers.authorization;
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.userService.uploadImage(payload, tokenWithoutPrefix);
  }

  @Get('images')
  @ApiOperation({ summary: 'Get all images of user' })
  @ApiResponse({ status: 200, description: `User's list image` })
  @ApiResponse({ status: 400, description: 'Not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getImages(@Req() req: Request) {
    const token = req.headers.authorization;
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.userService.getImages(tokenWithoutPrefix);
  }
}
