import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { PostService } from './post.service';
import { LikeRequest, PostPagination, PostRequest } from 'src/model/post.model';
import { ApiTags } from '@nestjs/swagger';

@Controller('posts')
@UseGuards(AuthGuard)
@ApiTags('Post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  async create(
    @Body() data: PostRequest,
    @Headers('authorization') token: string,
  ) {
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.postService.create(data, tokenWithoutPrefix);
  }

  @Put('update/:id')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() data: PostRequest) {
    return this.postService.update(id, data);
  }

  @Patch('delete/:id')
  @HttpCode(200)
  async delete(@Param('id') id: string) {
    return this.postService.delete(id);
  }

  @Get()
  @HttpCode(200)
  async pagination(@Query() query: PostPagination) {
    return this.postService.getPagination(query);
  }

  @Post('like')
  @HttpCode(200)
  async like(
    @Query() query: LikeRequest,
    @Headers('authorization') token: string,
  ) {
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.postService.likeOrNot(query, tokenWithoutPrefix);
  }
}
