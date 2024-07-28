import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PrismaModule } from 'src/prisma.module';
import { CommentController } from './comment.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  controllers: [CommentController],
  providers: [CommentService],
  imports: [PrismaModule, TokenModule, UserModule],
  exports: [PrismaModule, TokenModule],
})
export class CommentModule {}
