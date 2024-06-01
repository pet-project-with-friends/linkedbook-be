import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { LikeRequest, PostPagination, PostRequest } from 'src/model/post.model';
import { PostService } from './post.service';

@Controller('posts')
@UseGuards(AuthGuard)
@ApiTags('Post')
@ApiBearerAuth()
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create new a post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'string' },
        content: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Create successfully!' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Body() data: PostRequest, @Req() req: Request) {
    const token = req.headers.authorization;
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.postService.create(data, tokenWithoutPrefix);
  }

  @Put('update/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a post by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'string' },
        content: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Update successfully!' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async update(@Param('id') id: string, @Body() data: PostRequest) {
    return this.postService.update(id, data);
  }

  @Patch('delete/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a post by id' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Update successfully!' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async delete(@Param('id') id: string) {
    return this.postService.delete(id);
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all active posts' })
  @ApiQuery({ name: 'skip' })
  @ApiQuery({ name: 'limit' })
  @ApiResponse({ status: 200, description: 'Return paginated list of posts.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async pagination(@Query() query: PostPagination) {
    return this.postService.getPagination(query);
  }

  @Post('like')
  @HttpCode(200)
  @ApiOperation({ summary: 'Like or unlike a post' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async like(@Query() query: LikeRequest, @Req() req: Request) {
    const token = req.headers.authorization;
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.postService.likeOrNot(query, tokenWithoutPrefix);
  }
}
