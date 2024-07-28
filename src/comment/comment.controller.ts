import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { CommentRequest } from 'src/model/post.model';
import { CommentService } from './comment.service';

@Controller('comment')
@ApiTags('Comment')
@UseGuards(AuthGuard)
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create new a comment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        postId: { type: 'string', example: 'string' },
        content: { type: 'string', example: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Comment successfully!' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Failed to comment.' })
  async createComment(@Body() data: CommentRequest, @Req() req: Request) {
    const token = req.headers.authorization;
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return this.commentService.createComment(data, tokenWithoutPrefix);
  }
}
