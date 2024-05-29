import { PrismaModule } from 'src/prisma.module';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [UserService],
  imports: [PrismaModule],
  exports: [UserService, PrismaModule],
})
export class UserModule {}
