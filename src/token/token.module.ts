import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/jwtConstants';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService],
  exports: [TokenService, PrismaModule],
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '14d' },
    }),
    PrismaModule,
  ],
})
export class TokenModule {}
