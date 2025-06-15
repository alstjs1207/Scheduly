// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { StudentService } from './services/student.service';
import { AuthService } from './services/auth.service';
import { StudentController } from './controllers/student.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { AuthController } from './controllers/auth.controller';
import { ScheduleService } from './services/schedule.service';
import { AuthModule } from './modules/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [StudentController, ScheduleController, AuthController],
  providers: [PrismaService, StudentService, ScheduleService, AuthService],
})
export class AppModule {}

