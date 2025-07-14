import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CommonModule } from '@common/common.module';
import { AuthController } from '@modules/auth/auth.controller';

@Module({
  imports: [CommonModule],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
