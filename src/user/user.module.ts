import { PrismaModule } from 'src/prisma.module';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule, TokenModule],
  exports: [UserService, PrismaModule],
})
export class UserModule {}
