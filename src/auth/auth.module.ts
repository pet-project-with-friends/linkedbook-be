import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenModule } from 'src/token/token.module';
import { PrismaModule } from 'src/prisma.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, PrismaModule, TokenModule],
  exports: [AuthService],
})
export class AuthModule {}
